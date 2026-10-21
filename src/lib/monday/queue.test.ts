import { createRequestQueue } from './queue'
import { MondayApiError } from './errors'

describe('request queue', () => {
  it('runs requests one at a time, in the order they were queued', async () => {
    const queue = createRequestQueue()
    const events: string[] = []
    const task = (name: string, ms: number) => () =>
      new Promise<string>((resolve) => {
        events.push(`start ${name}`)
        setTimeout(() => {
          events.push(`end ${name}`)
          resolve(name)
        }, ms)
      })

    const results = await Promise.all([queue.run(task('a', 20)), queue.run(task('b', 1))])

    expect(results).toEqual(['a', 'b'])
    expect(events).toEqual(['start a', 'end a', 'start b', 'end b'])
  })
})

describe('retries', () => {
  const rateLimited = () =>
    new MondayApiError('Rate Limit Exceeded', {
      status: 429,
      errors: [{ message: 'Rate Limit Exceeded', extensions: { code: 'RATE_LIMIT_EXCEEDED', retry_in_seconds: 7 } }],
    })

  it('waits the seconds monday asks for, then tries again', async () => {
    const waits: number[] = []
    const queue = createRequestQueue({ wait: async (ms) => void waits.push(ms) })
    const task = vi.fn().mockRejectedValueOnce(rateLimited()).mockResolvedValueOnce('ok')

    await expect(queue.run(task)).resolves.toBe('ok')

    expect(task).toHaveBeenCalledTimes(2)
    expect(waits).toEqual([7000])
  })

  it('does not retry a mistake in the query: retrying cannot fix it', async () => {
    const waits: number[] = []
    const queue = createRequestQueue({ wait: async (ms) => void waits.push(ms) })
    const invalidColumn = new MondayApiError('Column not found', {
      status: 200,
      errors: [{ message: 'Column not found', extensions: { code: 'InvalidColumnIdException' } }],
    })
    const task = vi.fn().mockRejectedValue(invalidColumn)

    await expect(queue.run(task)).rejects.toBe(invalidColumn)

    expect(task).toHaveBeenCalledTimes(1)
    expect(waits).toEqual([])
  })

  it('gives up after 3 attempts', async () => {
    const queue = createRequestQueue({ wait: async () => {} })
    const task = vi.fn().mockRejectedValue(rateLimited())

    await expect(queue.run(task)).rejects.toBeInstanceOf(MondayApiError)

    expect(task).toHaveBeenCalledTimes(3)
  })

  it('waits a short moment on a network error, and keeps the queue moving after a failure', async () => {
    const waits: number[] = []
    const queue = createRequestQueue({ wait: async (ms) => void waits.push(ms) })
    const offline = new MondayApiError('Failed to fetch', { status: null })

    const failing = queue.run(vi.fn().mockRejectedValue(offline))
    const next = queue.run(async () => 'next')

    await expect(failing).rejects.toBe(offline)
    await expect(next).resolves.toBe('next')
    expect(waits).toEqual([1500, 1500])
  })

  it('never retries a setup error such as a missing token', async () => {
    const queue = createRequestQueue({ wait: async () => {} })
    const missingToken = new MondayApiError('MONDAY_API_TOKEN is missing', { status: 500, isSetupError: true })
    const task = vi.fn().mockRejectedValue(missingToken)

    await expect(queue.run(task)).rejects.toBe(missingToken)

    expect(task).toHaveBeenCalledTimes(1)
  })
})
