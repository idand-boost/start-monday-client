import { MondayApiError, retryDelayMs } from './errors'

// One queue for every monday API call (error-handling lecture).
// monday limits how many calls an app makes at once and per minute. Sending them one at a time
// keeps the app under those limits, and when monday does say "slow down", only this queue waits:
// the page keeps working.
//
// Retries: only errors that go away on their own (rate limits, a locked board, a 500, the
// network), always after waiting, and at most MAX_ATTEMPTS times in total.

const MAX_ATTEMPTS = 3

export interface RequestQueue {
  /** Runs `task` after every task queued before it has finished, retrying it when that can help. */
  run<T>(task: () => Promise<T>): Promise<T>
}

interface QueueOptions {
  /** How the queue waits between attempts. Tests pass a fake one. */
  wait?: (ms: number) => Promise<void>
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function createRequestQueue({ wait = sleep }: QueueOptions = {}): RequestQueue {
  let tail: Promise<unknown> = Promise.resolve()

  async function withRetries<T>(task: () => Promise<T>): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await task()
      } catch (error) {
        if (!(error instanceof MondayApiError)) throw error
        const delay = retryDelayMs(error)
        if (delay === null || attempt >= MAX_ATTEMPTS) throw error
        console.warn(`[monday] ${error.codes.join(', ') || error.message}. Trying again in ${delay} ms`)
        await wait(delay)
      }
    }
  }

  return {
    run(task) {
      const result = tail.then(() => withRetries(task))
      // The next task waits for this one whether it succeeded or failed.
      tail = result.catch(() => undefined)
      return result
    },
  }
}
