import { getBackendUrl, getSessionToken } from './monday/session'

// Calls to your own backend on monday code (track 3). Every request carries the session token,
// so the backend knows who is calling: it verifies the token with the app's client secret.
// The template's screens don't use it yet. Example: backendFetch<Settings>('/api/settings')

export class BackendError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'BackendError'
    this.status = status
  }
}

export async function backendFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const [baseUrl, sessionToken] = await Promise.all([getBackendUrl(), getSessionToken()])
  const headers = new Headers(init.headers)
  headers.set('Authorization', sessionToken)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const response = await fetch(new URL(path, baseUrl), { ...init, headers })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new BackendError(response.status, text || `The backend answered ${response.status}`)
  }
  return (response.status === 204 ? undefined : await response.json()) as T
}
