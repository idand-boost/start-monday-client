import { SeamlessApiClient, SeamlessApiClientError } from '@mondaydotcomorg/api'
import { isInsideMonday } from './environment'
import { MondayApiError, type MondayErrorDetail } from './errors'
import { DEV_ENDPOINT } from './operations'
import { createRequestQueue } from './queue'

// One function, two worlds (monday-api lecture):
// - inside monday: SeamlessApiClient asks monday to make the call, with the app's scopes. No token.
// - in a plain browser tab (npm run dev): POST to the dev-only endpoint in the Vite dev server.
//   The server adds the token, so it never reaches the browser.
// Every call goes through one queue, which also retries what is worth retrying.

type Variables = Record<string, unknown>

const seamless = isInsideMonday ? new SeamlessApiClient() : null
const queue = createRequestQueue()

export async function mondayRequest<T>(query: string, variables: Variables = {}): Promise<T> {
  // A retried mutation could run twice. monday ignores repeats that carry the same key.
  const idempotencyKey = isMutation(query) ? crypto.randomUUID() : undefined
  return queue.run(() =>
    seamless ? seamlessRequest<T>(seamless, query, variables, idempotencyKey) : devRequest<T>(query, variables),
  )
}

function isMutation(query: string) {
  return query.trimStart().startsWith('mutation')
}

async function seamlessRequest<T>(
  client: SeamlessApiClient,
  query: string,
  variables: Variables,
  idempotencyKey?: string,
) {
  try {
    return unwrapData<T>(await client.request<unknown>(query, variables, { idempotencyKey }))
  } catch (error) {
    throw fromSeamlessError(error)
  }
}

function fromSeamlessError(error: unknown): unknown {
  if (error instanceof SeamlessApiClientError) {
    const errors = (error.response.errors ?? []) as MondayErrorDetail[]
    const status = errors.find((detail) => detail.extensions?.status_code)?.extensions?.status_code ?? 200
    return new MondayApiError(error.message, { status, errors })
  }
  if (error instanceof Error && /timed out/i.test(error.message)) {
    return new MondayApiError(error.message, { status: null })
  }
  return error
}

interface DevEndpointReply<T> {
  data?: T
  error?: string
  errors?: MondayErrorDetail[]
  setup?: boolean
}

async function devRequest<T>(query: string, variables: Variables): Promise<T> {
  // The endpoint is dev-only. In a production build this branch is removed, so a plain
  // tab outside monday has no way to reach monday at all.
  if (!import.meta.env.DEV) {
    throw new MondayApiError('monday is only available inside monday or in npm run dev', {
      status: null,
      isSetupError: true,
    })
  }

  let response: Response
  try {
    response = await fetch(DEV_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
  } catch (error) {
    throw new MondayApiError(error instanceof Error ? error.message : 'network error', { status: null })
  }

  const reply = (await response.json().catch(() => ({}))) as DevEndpointReply<T>
  const hasErrors = (reply.errors?.length ?? 0) > 0
  if (response.ok && !hasErrors && reply.data !== undefined) return reply.data

  throw new MondayApiError(reply.error ?? `the dev endpoint answered ${response.status}`, {
    status: response.status,
    errors: reply.errors,
    isSetupError: reply.setup,
  })
}

// Inside monday the response comes back wrapped as { data: { ...fields } } (sometimes with extra
// fields like account_id). Peel the wrapper so both worlds return just { boards: ... }.
function unwrapData<T>(response: unknown): T {
  let current = response
  while (typeof current === 'object' && current !== null && 'data' in current && typeof current.data === 'object') {
    current = current.data
  }
  return current as T
}
