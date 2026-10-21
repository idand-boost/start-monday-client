import { useSuspenseQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { DevSetupAlert } from '@/components/monday/dev-setup-alert'
import { WrongViewAlert } from '@/components/monday/wrong-view-alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { itemQueryOptions } from '../api/get-item'

interface ItemScreenProps {
  instanceType: string | undefined
  itemId: string | undefined
}

/** What an item view shows: the item it is on. An item view's context carries boardId and itemId. */
export function ItemScreen({ instanceType, itemId }: ItemScreenProps) {
  if (instanceType !== 'item_view') {
    return <WrongViewAlert featureName="Item view" path="/item" currentInstanceType={instanceType} />
  }
  if (!itemId) {
    return (
      <DevSetupAlert title="No test item yet">
        Add <code className="font-mono">VITE_DEV_ITEM_ID</code> to <code className="font-mono">.env</code> (the number
        after /pulses/ in an item&apos;s URL) and restart <code className="font-mono">npm run dev</code>.
      </DevSetupAlert>
    )
  }
  return <ItemCard itemId={itemId} />
}

function ItemCard({ itemId }: { itemId: string }) {
  const { data: item } = useSuspenseQuery(itemQueryOptions(itemId))

  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <FileText className="size-4" /> This item view is on
        </CardDescription>
        <CardTitle>
          <h2 className="text-2xl font-semibold">{item.name}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">item id {item.id}</Badge>
        {item.board && (
          <span>
            on the board <strong className="text-foreground">{item.board.name}</strong>
          </span>
        )}
      </CardContent>
    </Card>
  )
}
