import { queryOptions } from '@tanstack/react-query'
import { mondayRequest } from '@/lib/monday/client'
import { UserFacingError } from '@/lib/monday/errors'
import { GET_ITEM } from '@/lib/monday/operations'
import { MONDAY_QUERY_KEY } from '@/lib/monday/query-keys'

export interface Item {
  id: string
  name: string
  board: { id: string; name: string } | null
}

export async function getItem(itemId: string): Promise<Item> {
  const { items } = await mondayRequest<{ items: Item[] }>(GET_ITEM, { itemId })
  const item = items[0]
  if (!item)
    throw new UserFacingError(
      `Item ${itemId} was not found, or the app can't read it (it needs the boards:read scope).`,
    )
  return item
}

export const itemQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: [...MONDAY_QUERY_KEY, 'item', itemId],
    queryFn: () => getItem(itemId),
  })
