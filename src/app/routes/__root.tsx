import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppLayout } from '@/components/layouts/app-layout'
import { MockSettingsPanel } from '@/components/monday/mock-settings-panel'
import { isInsideMonday } from '@/lib/monday/sdk'
import type { RouterContext } from '../router'

// The mock panel only exists in a plain tab during `npm run dev`: never inside monday, never in a build.
const showMockPanel = import.meta.env.DEV && !isInsideMonday

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <p className="text-muted-foreground">There is no screen at this address.</p>,
})

function RootLayout() {
  return (
    <AppLayout toolbar={showMockPanel ? <MockSettingsPanel /> : undefined}>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </AppLayout>
  )
}
