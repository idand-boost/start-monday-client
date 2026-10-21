import { queryOptions } from '@tanstack/react-query'
import { mondayRequest } from '@/lib/monday/client'
import { UserFacingError } from '@/lib/monday/errors'
import { GET_BOARD } from '@/lib/monday/operations'
import { MONDAY_QUERY_KEY } from '@/lib/monday/query-keys'

export interface Board {
  id: string
  name: string
}

export async function getBoard(boardId: string): Promise<Board> {
  const { boards } = await mondayRequest<{ boards: Board[] }>(GET_BOARD, { boardId })
  const board = boards[0]
  if (!board)
    throw new UserFacingError(
      `Board ${boardId} was not found, or the app can't read it (it needs the boards:read scope).`,
    )
  return board
}

export const boardQueryOptions = (boardId: string) =>
  queryOptions({
    queryKey: [...MONDAY_QUERY_KEY, 'board', boardId],
    queryFn: () => getBoard(boardId),
  })
