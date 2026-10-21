import { queryOptions } from '@tanstack/react-query'
import { mondayRequest } from './client'
import { GET_ME } from './operations'
import { MONDAY_QUERY_KEY } from './query-keys'

// The signed-in user. Shared: the access check and the greeting both read it, from one cached call.

export interface Me {
  id: string
  name: string
  is_guest: boolean
  is_view_only: boolean
  is_pending: boolean
  is_verified: boolean
}

export async function getMe(): Promise<Me> {
  const { me } = await mondayRequest<{ me: Me | null }>(GET_ME)
  if (!me) throw new Error('monday returned no user for this session')
  return me
}

export const meQueryOptions = () =>
  queryOptions({
    queryKey: [...MONDAY_QUERY_KEY, 'me'],
    queryFn: getMe,
    // The user does not change while the page is open.
    staleTime: Infinity,
  })
