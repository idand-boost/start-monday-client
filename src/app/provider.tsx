import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { MainErrorFallback } from '@/components/errors/main-error-fallback'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { useThemeSync } from '@/hooks/use-theme-sync'
import { MondayProvider, useMondayContext } from '@/lib/monday/context'
import { queryClient } from './router'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <MondayProvider fallback={<AppSkeleton />}>
          <ThemedToaster />
          {children}
        </MondayProvider>
        {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

/** Follows monday's theme: the page through <html>, and the toasts. */
function ThemedToaster() {
  const { theme } = useMondayContext()
  useThemeSync(theme)
  return <Toaster theme={theme === 'light' ? 'light' : 'dark'} position="top-center" />
}

function AppSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
