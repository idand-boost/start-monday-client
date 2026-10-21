// What went wrong with a monday API call, and what the app does about it (error-handling lecture).
// Most monday errors come back with HTTP 200 and an `errors` array, so the status alone says little:
// the error codes decide.

export interface MondayErrorDetail {
  message: string
  extensions?: { code?: string; status_code?: number; retry_in_seconds?: number; request_id?: string }
}

interface MondayApiErrorInit {
  /** HTTP status, when there was a response. null for network errors and timeouts. */
  status: number | null
  errors?: MondayErrorDetail[]
  /** Our own setup is wrong (no token, operation not allowed...). Retrying never helps. */
  isSetupError?: boolean
}

/** Every failed monday call ends up as one of these, whichever world it came from. */
export class MondayApiError extends Error {
  readonly status: number | null
  readonly errors: MondayErrorDetail[]
  readonly isSetupError: boolean

  constructor(message: string, init: MondayApiErrorInit) {
    super(message)
    this.name = 'MondayApiError'
    this.status = init.status
    this.errors = init.errors ?? []
    this.isSetupError = init.isSetupError ?? false
  }

  /** monday's error codes, for logs. */
  get codes(): string[] {
    return this.errors.map((error) => error.extensions?.code ?? error.message)
  }
}

/** A failure whose message was written for the user ("Board 42 was not found"). Shown as it is. */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserFacingError'
  }
}

const SLOW_DOWN_CODES = new Set([
  'COMPLEXITY_BUDGET_EXHAUSTED',
  'RATE_LIMIT_EXCEEDED',
  'Rate Limit Exceeded',
  'maxConcurrencyExceeded',
  'IP_RATE_LIMIT_EXCEEDED',
  'MINUTE_RATE_LIMIT_EXCEEDED',
])
const isSlowDown = (detail: MondayErrorDetail) => SLOW_DOWN_CODES.has(detail.extensions?.code ?? detail.message)

const TEMPORARY_STATUSES = new Set([423, 500, 502, 503, 504])
const DEFAULT_SLOW_DOWN_MS = 5_000
const SHORT_WAIT_MS = 1_500

/**
 * How long to wait before trying again, or null when trying again cannot help
 * (a wrong query, a missing permission, a bad id: fix the code instead).
 */
export function retryDelayMs(error: MondayApiError): number | null {
  if (error.isSetupError) return null

  const slowDown = error.errors.find(isSlowDown)
  if (slowDown || error.status === 429) {
    const seconds = slowDown?.extensions?.retry_in_seconds
    return seconds === undefined ? DEFAULT_SLOW_DOWN_MS : seconds * 1000
  }

  const isNetworkError = error.status === null
  if (isNetworkError || TEMPORARY_STATUSES.has(error.status ?? 0)) return SHORT_WAIT_MS
  return null
}

/** A short sentence for the screen. The details belong in the console, not in front of the user. */
export function toUserMessage(error: unknown): string {
  if (error instanceof UserFacingError) return error.message
  if (!(error instanceof MondayApiError)) return 'Something went wrong. The details are in the console.'
  if (error.isSetupError) return error.message
  if (error.status === null) return "Couldn't reach monday. Check your connection and try again."

  const isBusy = error.status === 429 || error.errors.some(isSlowDown)
  if (isBusy) return 'monday is busy right now. Try again in a minute.'

  const firstMessage = error.errors[0]?.message
  return firstMessage ? `monday said: ${firstMessage}` : 'monday could not complete the request. Try again.'
}
