import { createFileRoute } from '@tanstack/react-router'
import { itemQueryOptions } from '@/features/item/api/get-item'
import { ItemScreen } from '@/features/item/components/item-screen'

// The Item view feature in the Developer Center points here: http://localhost:5173/item
export const Route = createFileRoute('/_app/item')({
  loader: async ({ context: { monday, queryClient } }) => {
    const { instanceType } = monday
    const itemId = monday.itemId ? String(monday.itemId) : undefined
    if (instanceType === 'item_view' && itemId) await queryClient.ensureQueryData(itemQueryOptions(itemId))
    return { instanceType, itemId }
  },
  component: ItemPage,
})

function ItemPage() {
  // What the loader prepared, not the live context: the screen never shows an item before it is loaded.
  const { instanceType, itemId } = Route.useLoaderData()
  return <ItemScreen instanceType={instanceType} itemId={itemId} />
}
