import { createFileRoute } from '@tanstack/react-router'
import { boardQueryOptions } from '@/features/board/api/get-board'
import { BoardScreen } from '@/features/board/components/board-screen'

// The Board view feature in the Developer Center points here: http://localhost:5173/board
export const Route = createFileRoute('/_app/board')({
  loader: async ({ context: { monday, queryClient } }) => {
    const { instanceType } = monday
    const boardId = monday.boardId ? String(monday.boardId) : undefined
    if (instanceType === 'board_view' && boardId) await queryClient.ensureQueryData(boardQueryOptions(boardId))
    return { instanceType, boardId }
  },
  component: BoardPage,
})

function BoardPage() {
  // What the loader prepared, not the live context: the screen never shows a board before it is loaded.
  const { instanceType, boardId } = Route.useLoaderData()
  return <BoardScreen instanceType={instanceType} boardId={boardId} />
}
