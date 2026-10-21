import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from '@/components/ui/sonner'
import { renderWithQueryClient, stubMondayApi } from '@/testing/test-utils'
import { GreetButton } from './greet-button'

afterEach(() => vi.unstubAllGlobals())

// In a plain browser tab, monday.execute('notice') is stood in for by a toast.
describe('GreetButton', () => {
  it('greets the signed-in user by name', async () => {
    stubMondayApi({ me: { id: '1', name: 'Dana' } })
    renderWithQueryClient(
      <>
        <GreetButton />
        <Toaster />
      </>,
    )

    await userEvent.click(screen.getByRole('button', { name: /greet me/i }))

    expect(await screen.findByText('Hello, Dana 👋')).toBeInTheDocument()
  })

  it('still greets when the user cannot be read, for example before MONDAY_API_TOKEN is set', async () => {
    const missingToken = { error: 'MONDAY_API_TOKEN is missing in .env. See the README.', setup: true }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(missingToken), { status: 500 })))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithQueryClient(
      <>
        <GreetButton />
        <Toaster />
      </>,
    )

    await userEvent.click(screen.getByRole('button', { name: /greet me/i }))

    expect(await screen.findByText('Hello there 👋')).toBeInTheDocument()
  })
})
