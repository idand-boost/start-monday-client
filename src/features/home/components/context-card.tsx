import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { AppContext } from '@/lib/monday/types'

interface ContextCardProps {
  context: AppContext
  isInsideMonday: boolean
}

/** What monday's context says right now. Change the mock settings in the header and watch it follow. */
export function ContextCard({ context, isInsideMonday }: ContextCardProps) {
  const rows: [string, string][] = [
    ['instanceType', context.instanceType ?? '—'],
    ['boardId', context.boardId ? String(context.boardId) : '—'],
    ['itemId', context.itemId ? String(context.itemId) : '—'],
    ['theme', context.theme],
    ['user.id', String(context.user.id)],
    ['user role', context.user.isGuest ? 'guest' : context.user.isViewOnly ? 'view-only' : 'member'],
  ]

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <h2 className="text-base">monday context</h2>
          <Badge variant={isInsideMonday ? 'default' : 'outline'}>{isInsideMonday ? 'Inside monday' : 'Mock'}</Badge>
        </CardTitle>
        <CardDescription>
          From <code className="font-mono">monday.listen(&apos;context&apos;)</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="font-mono text-xs leading-5 text-muted-foreground">{label}</dt>
              <dd className="truncate font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
