import { existsSync, readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import { parseEnv } from 'node:util'
import { ApiClient } from '@mondaydotcomorg/api'
import type { Plugin } from 'vite'
import { ALLOWED_OPERATIONS, DEV_ENDPOINT } from '../src/lib/monday/operations.ts'

// Dev-only endpoint that lets the app talk to monday from a plain browser tab.
//
// The token (MONDAY_API_TOKEN, read from .env) lives only in this Node process:
// - the name has no VITE_ prefix, so Vite never sends it to the browser
// - it is never logged, and never put in a response
// - `apply: 'serve'` means this plugin does not exist in `npm run build`
//
// It only answers POST requests with a JSON body, from a page on localhost, and
// only for the operations listed in src/lib/monday/operations.ts.
//
// Replies:
// - { data }                         monday answered
// - { error, errors, status }        monday refused: same status and errors as monday sent
// - { error, setup: true }           this endpoint refused (no token, not localhost, not allowed...)

const MAX_BODY_BYTES = 16 * 1024
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])
// Headers that proxies and tunnels (ngrok, cloudflared, mapps tunnel...) add.
const PROXY_HEADERS = [
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'forwarded',
  'via',
  'cf-connecting-ip',
]

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
  res.end(JSON.stringify(body))
}

function refuse(res: ServerResponse, status: number, error: string) {
  send(res, status, { error, setup: true })
}

function hostnameOf(hostHeader: string | undefined) {
  if (!hostHeader) return null
  try {
    return new URL(`http://${hostHeader}`).hostname
  } catch {
    return null
  }
}

function isLoopback(address: string | undefined) {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

/** Returns a reason to refuse the request, or null if it comes from a page on this dev server. */
function refusal(req: IncomingMessage): string | null {
  if (!isLoopback(req.socket.remoteAddress)) return 'not a local connection'
  if (PROXY_HEADERS.some((h) => req.headers[h] !== undefined)) return 'tunnels and proxies are refused'

  const host = hostnameOf(req.headers.host)
  if (!host || !LOCAL_HOSTNAMES.has(host)) return 'host is not localhost'

  // Browsers always send Origin on a POST. It must be a page served from this dev server.
  const origin = req.headers.origin
  if (!origin) return 'missing Origin'
  let originUrl: URL
  try {
    originUrl = new URL(origin)
  } catch {
    return 'bad Origin'
  }
  if (
    originUrl.protocol !== 'http:' ||
    !LOCAL_HOSTNAMES.has(originUrl.hostname) ||
    originUrl.host !== req.headers.host
  ) {
    return 'requests from other websites are refused'
  }

  const site = req.headers['sec-fetch-site']
  if (site !== undefined && site !== 'same-origin') return 'requests from other websites are refused'
  return null
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('body is not valid JSON'))
      }
    })
    req.on('error', reject)
  })
}

// Read the token from the .env files only. Vite's loadEnv lets a variable exported in the shell
// (for example in ~/.zshrc) win over .env, which silently uses the wrong token.
function readTokenFromEnvFiles(dir: string) {
  let token: string | undefined
  for (const name of ['.env', '.env.local']) {
    const file = join(dir, name)
    if (existsSync(file)) token = parseEnv(readFileSync(file, 'utf8')).MONDAY_API_TOKEN?.trim() || token
  }
  return token
}

/** What monday sent back with a failed request. graphql-request's ClientError has this shape. */
interface MondayErrorResponse {
  response: { status: number; errors?: unknown[]; headers?: { get?(name: string): string | null } }
}

// Duck-typed: the package's CommonJS build does not expose ClientError as a named ESM export.
function isMondayErrorResponse(err: unknown): err is MondayErrorResponse {
  const response = (err as { response?: { status?: unknown } } | null)?.response
  return typeof response?.status === 'number'
}

/** A short, token-free message for the terminal. The library appends the full request after ": {". */
function safeMessage(err: unknown, token: string) {
  const raw = err instanceof Error ? err.message : 'unknown error'
  return raw.split(': {')[0].split(token).join('***')
}

export function mondayDevApi(): Plugin {
  return {
    name: 'monday-dev-api',
    apply: 'serve',
    configureServer(server) {
      // Read the token here, in Node. It is never copied anywhere else.
      const token = readTokenFromEnvFiles(server.config.envDir || process.cwd())
      const client = token ? new ApiClient({ token }) : null

      server.middlewares.use(DEV_ENDPOINT, async (req, res) => {
        const why = refusal(req)
        if (why) return refuse(res, 403, why)
        if (req.method !== 'POST') return refuse(res, 405, 'POST only')
        if (!/^application\/json\s*(;|$)/i.test(req.headers['content-type'] ?? '')) {
          return refuse(res, 415, 'send JSON (Content-Type: application/json)')
        }
        if (!client || !token) return refuse(res, 500, 'MONDAY_API_TOKEN is missing in .env. See the README.')

        let body: unknown
        try {
          body = await readJson(req)
        } catch (err) {
          return refuse(res, 400, err instanceof Error ? err.message : 'bad request')
        }
        const { query, variables } = (body ?? {}) as { query?: unknown; variables?: unknown }
        if (typeof query !== 'string' || !ALLOWED_OPERATIONS.includes(query)) {
          return refuse(res, 400, 'this operation is not in ALLOWED_OPERATIONS (src/lib/monday/operations.ts)')
        }
        if (
          variables !== undefined &&
          (typeof variables !== 'object' || variables === null || Array.isArray(variables))
        ) {
          return refuse(res, 400, 'variables must be an object')
        }

        try {
          const data = await client.request(query, variables as Record<string, unknown> | undefined)
          send(res, 200, { data })
        } catch (err) {
          const message = safeMessage(err, token)
          server.config.logger.warn(`[monday-dev-api] monday request failed: ${message}`)

          // Pass monday's own answer back: its status (often 200 even on errors), its errors array
          // and its Retry-After header. The app decides what to do with them (src/lib/monday/errors.ts).
          if (isMondayErrorResponse(err)) {
            const retryAfter = err.response.headers?.get?.('retry-after')
            return send(
              res,
              err.response.status,
              { error: message, errors: err.response.errors ?? [], status: err.response.status },
              retryAfter ? { 'Retry-After': retryAfter } : {},
            )
          }
          // No answer from monday at all (network down, timeout).
          send(res, 504, { error: message, errors: [], status: 504 })
        }
      })
    },
  }
}
