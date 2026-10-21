import { createFileRoute, Outlet, type ErrorComponentProps } from '@tanstack/react-router'
import { RouteError } from '@/components/errors/route-error'
import { accessQueryOptions, AccessDeniedError } from '@/features/access/api/check-access'
import { AccessDenied } from '@/features/access/components/access-denied'

// Every screen sits under this pathless route, so the access check runs before any of them
// loads data. Guests and view-only users see why they can't use the app instead.
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const access = await queryClient.ensureQueryData(accessQueryOptions(queryClient))
    return { access }
  },
  errorComponent: AccessError,
  component: Outlet,
})

function AccessError({ error }: ErrorComponentProps) {
  if (error instanceof AccessDeniedError) return <AccessDenied reason={error.message} />
  return <RouteError error={error} />
}
