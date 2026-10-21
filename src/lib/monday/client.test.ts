import { mondayRequest } from './client'
import { MondayApiError } from './errors'
import { GET_BOARD } from './operations'

// In the test browser (jsdom) the page is not in an iframe, so the client is in the
// plain-tab world: it talks to the dev endpoint.
function answerWith(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

describe('mondayRequest in a plain browser tab', () => {
  it('sends the query to the dev endpoint and returns the data', async () => {
    const fetchMock = answerWith(200, { data: { boards: [{ id: '1', name: 'Roadmap' }] } })

    const data = await mondayRequest<{ boards: { name: string }[] }>(GET_BOARD, { boardId: '1' })

    expect(data.boards[0]?.name).toBe('Roadmap')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/__monday')
    expect(JSON.parse(init.body as string)).toEqual({ query: GET_BOARD, variables: { boardId: '1' } })
  })

  it('treats a 200 answer with an errors array as a failure', async () => {
    answerWith(200, {
      error: 'monday refused',
      errors: [{ message: 'Board not found', extensions: { code: 'InvalidBoardIdException' } }],
      status: 200,
    })

    const failure = await mondayRequest(GET_BOARD, { boardId: 'nope' }).catch((e: unknown) => e)

    expect(failure).toBeInstanceOf(MondayApiError)
    expect((failure as MondayApiError).codes).toEqual(['InvalidBoardIdException'])
    expect((failure as MondayApiError).status).toBe(200)
  })

  it('reports a refusal of the dev endpoint as a setup error', async () => {
    answerWith(500, { error: 'MONDAY_API_TOKEN is missing in .env. See the README.', setup: true })

    const failure = await mondayRequest(GET_BOARD, { boardId: '1' }).catch((e: unknown) => e)

    expect(failure).toMatchObject({ isSetupError: true, message: expect.stringContaining('MONDAY_API_TOKEN') })
  })

  it('reports a network failure as an error without a status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    vi.useFakeTimers()
    const pending = mondayRequest(GET_BOARD, { boardId: '1' }).catch((e: unknown) => e)
    await vi.runAllTimersAsync() // the retries wait before trying again
    const failure = await pending
    vi.useRealTimers()

    expect(failure).toMatchObject({ status: null })
    expect(fetch).toHaveBeenCalledTimes(3)
  })
})
