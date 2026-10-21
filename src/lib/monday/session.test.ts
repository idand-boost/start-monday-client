import { jwtDecode } from 'jwt-decode'
import { setMockSettings } from './mock-settings'
import { getBackendUrl, getSessionToken } from './session'
import type { SessionTokenClaims } from './types'

// jsdom is a plain browser tab, so these run against the SDK mock: the same code as in production.
describe('session in a plain browser tab', () => {
  it('gives the local backend URL', async () => {
    await expect(getBackendUrl()).resolves.toBe('http://localhost:8080')
  })

  it("gives a session token for the mock user's role", async () => {
    setMockSettings({ role: 'guest' })

    const claims = jwtDecode<SessionTokenClaims>(await getSessionToken())

    expect(claims.dat).toMatchObject({ is_guest: true, is_view_only: false })
  })
})
