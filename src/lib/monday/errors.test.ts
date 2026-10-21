import { MondayApiError, toUserMessage, UserFacingError } from './errors'

describe('toUserMessage', () => {
  it('passes setup problems through, because they tell the developer what to fix', () => {
    const missingToken = new MondayApiError('MONDAY_API_TOKEN is missing in .env. See the README.', {
      status: 500,
      isSetupError: true,
    })

    expect(toUserMessage(missingToken)).toBe('MONDAY_API_TOKEN is missing in .env. See the README.')
  })

  it("shows monday's own message when monday refused the request", () => {
    const notFound = new MondayApiError('monday refused', {
      status: 200,
      errors: [{ message: 'Board not found', extensions: { code: 'InvalidBoardIdException' } }],
    })

    expect(toUserMessage(notFound)).toBe('monday said: Board not found')
  })

  it('asks to try again later when monday is busy', () => {
    const busy = new MondayApiError('Rate Limit Exceeded', { status: 429 })

    expect(toUserMessage(busy)).toBe('monday is busy right now. Try again in a minute.')
  })

  it('says monday could not be reached on a network error', () => {
    expect(toUserMessage(new MondayApiError('Failed to fetch', { status: null }))).toBe(
      "Couldn't reach monday. Check your connection and try again.",
    )
  })

  it('never shows the raw text of an unexpected error', () => {
    expect(toUserMessage(new TypeError("Cannot read properties of undefined (reading 'name')"))).toBe(
      'Something went wrong. The details are in the console.',
    )
  })

  it('shows messages that were written for the user as they are', () => {
    expect(toUserMessage(new UserFacingError('Board 42 was not found.'))).toBe('Board 42 was not found.')
  })
})
