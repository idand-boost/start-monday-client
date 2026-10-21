import { useSuspenseQuery } from '@tanstack/react-query'
import { LayoutGrid } from 'lucide-react'
import { DevSetupAlert } from '@/components/monday/dev-setup-alert'
import { WrongViewAlert } from '@/components/monday/wrong-view-alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { boardQueryOptions } from '../api/get-board'

interface BoardScreenProps {
  instanceType: string | undefined
  boardId: string | undefined
}

/** What a board view shows: the board it is on. A board view's context carries its boardId. */
export function BoardScreen({ instanceType, boardId }: BoardScreenProps) {
  if (instanceType !== 'board_view') {
    return <WrongViewAlert featureName="Board view" path="/board" currentInstanceType={instanceType} />
  }
  if (!boardId) {
    return (
      <DevSetupAlert title="No test board yet">
        Add <code className="font-mono">VITE_DEV_BOARD_ID</code> to <code className="font-mono">.env</code> (the number
        after /boards/ in a board&apos;s URL) and restart <code className="font-mono">npm run dev</code>.
      </DevSetupAlert>
    )
  }
  return <BoardCard boardId={boardId} />
}

function BoardCard({ boardId }: { boardId: string }) {
  const { data: board } = useSuspenseQuery(boardQueryOptions(boardId))

  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <LayoutGrid className="size-4" /> This board view is on
        </CardDescription>
        <CardTitle>
          <h2 className="text-2xl font-semibold">{board.name}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">board id {board.id}</Badge>
        <span>
          From <code className="font-mono">context.boardId</code>, named with the{' '}
          <code className="font-mono">GetBoard</code> query.
        </span>
      </CardContent>
    </Card>
  )
}
