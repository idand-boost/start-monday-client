import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // Off for every query and mutation: the monday request queue (src/lib/monday/queue.ts)
      // already retries what is worth retrying. Two retry layers would multiply the calls.
      queries: { retry: false, staleTime: 60_000, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
}
