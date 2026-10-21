import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Suspense, type ReactElement } from 'react'
import { createQueryClient } from '@/lib/react-query'

/** Renders with a fresh query client, the way the app does. */
export function renderWithQueryClient(ui: ReactElement) {
  const queryClient = createQueryClient()
  const result = render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Loading…</p>}>{ui}</Suspense>
    </QueryClientProvider>,
  )
  return { queryClient, ...result }
}

/**
 * Makes the dev endpoint answer every monday call with `data`.
 * In tests the app is in a plain browser tab, so monday calls go to the dev endpoint via fetch.
 */
export function stubMondayApi(data: unknown) {
  const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ data }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
