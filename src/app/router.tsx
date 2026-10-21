import { createRouter } from '@tanstack/react-router'
import { RouteError } from '@/components/errors/route-error'
import { Skeleton } from '@/components/ui/skeleton'
import type { AppContext } from '@/lib/monday/types'
import { createQueryClient } from '@/lib/react-query'
import { routeTree } from './route-tree.gen'

/** What every route's beforeLoad and loader can read. `monday` is filled in by <App />. */
export interface RouterContext {
  queryClient: ReturnType<typeof createQueryClient>
  monday: AppContext
}

export const queryClient = createQueryClient()

export const router = createRouter({
  routeTree,
  context: { queryClient, monday: undefined! },
  defaultPreload: 'intent',
  // Loaders use the query cache, so the router must not cache on its own (tanstack skill).
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: () => <Skeleton className="h-32 w-full" />,
  defaultErrorComponent: RouteError,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
