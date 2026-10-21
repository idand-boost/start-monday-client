import { queryOptions, type QueryClient } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { MondayApiError } from '@/lib/monday/errors'
import { meQueryOptions, type Me } from '@/lib/monday/me'
import { MONDAY_QUERY_KEY } from '@/lib/monday/query-keys'
import { getContext, isInsideMonday } from '@/lib/monday/sdk'
import { getSessionToken } from '@/lib/monday/session'
import type { SessionTokenClaims } from '@/lib/monday/types'

// Who may use the app: members of the account only.
// Guests and view-only users ("visitors") have no API access, so every API call would fail for
// them. Stop them here, with a clear message, before any screen tries to load data.

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccessDeniedError'
  }
}

export interface Access {
  /** null only in local dev before MONDAY_API_TOKEN is set: the app runs, without a user. */
  me: Me | null
}

interface Role {
  isGuest: boolean
  isViewOnly: boolean
}

/** The role is signed into the session token, so it can be trusted more than the context. */
async function readRole(): Promise<Role> {
  const token = await getSessionToken()
  try {
    const { dat } = jwtDecode<SessionTokenClaims>(token)
    return { isGuest: Boolean(dat.is_guest), isViewOnly: Boolean(dat.is_view_only) }
  } catch (error) {
    if (isInsideMonday) throw error
    // Local dev with a VITE_DEV_TOKEN that is not a JWT: read the mock user's role instead.
    const { user } = await getContext()
    return { isGuest: Boolean(user.isGuest), isViewOnly: Boolean(user.isViewOnly) }
  }
}

async function readMe(queryClient: QueryClient): Promise<Me | null> {
  try {
    return await queryClient.fetchQuery(meQueryOptions())
  } catch (error) {
    const isMissingDevSetup = !isInsideMonday && error instanceof MondayApiError && error.isSetupError
    if (!isMissingDevSetup) throw error
    console.warn(`[access] Skipped the user check: ${error.message}`)
    return null
  }
}

export async function checkAccess(queryClient: QueryClient): Promise<Access> {
  const role = await readRole()
  if (role.isGuest) throw new AccessDeniedError('Guests of this account cannot use this app.')
  if (role.isViewOnly) throw new AccessDeniedError('View-only users cannot use this app.')

  const me = await readMe(queryClient)
  if (!me) return { me }
  if (me.is_pending) throw new AccessDeniedError('Your invitation to this account is still pending. Accept it first.')
  if (!me.is_verified) throw new AccessDeniedError('Verify your monday email address to use this app.')
  return { me }
}

export const accessQueryOptions = (queryClient: QueryClient) =>
  queryOptions({
    queryKey: [...MONDAY_QUERY_KEY, 'access'],
    queryFn: () => checkAccess(queryClient),
    staleTime: Infinity,
  })
