import { QueryClient } from '@tanstack/react-query'
import { setMockSettings } from '@/lib/monday/mock-settings'
import { AccessDeniedError, checkAccess } from './check-access'

const member = { id: '1', name: 'Dana', is_guest: false, is_view_only: false, is_pending: false, is_verified: true }

function mondayAnswersMe(me: object) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { me } }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => vi.unstubAllGlobals())

// jsdom is a plain browser tab: the SDK mock hands out a session token for the mock user's role.
describe('checkAccess', () => {
  it('lets a verified member in', async () => {
    mondayAnswersMe(member)

    await expect(checkAccess(new QueryClient())).resolves.toEqual({ me: member })
  })

  it('blocks a guest before calling the API: guests have no API access', async () => {
    setMockSettings({ role: 'guest' })
    const fetchMock = mondayAnswersMe(member)

    await expect(checkAccess(new QueryClient())).rejects.toBeInstanceOf(AccessDeniedError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('blocks a view-only user', async () => {
    setMockSettings({ role: 'view_only' })
    mondayAnswersMe(member)

    await expect(checkAccess(new QueryClient())).rejects.toThrow(/view-only/i)
  })

  it('blocks a user whose invitation is still pending', async () => {
    mondayAnswersMe({ ...member, is_pending: true })

    await expect(checkAccess(new QueryClient())).rejects.toThrow(/pending/i)
  })

  it('lets you in during local dev when there is no API token yet, without a user', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'MONDAY_API_TOKEN is missing', setup: true }), { status: 500 }),
        ),
    )

    await expect(checkAccess(new QueryClient())).resolves.toEqual({ me: null })
  })
})
