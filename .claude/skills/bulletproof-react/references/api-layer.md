# 📡 API Layer Reference

## Architecture Overview

The API layer follows a two-part pattern:

1. **Fetcher function** — a plain async function that makes the HTTP request
2. **Query/Mutation hook** — wraps the fetcher with `react-query` for caching, loading state, and error handling

## File Location

| Scope | Location |
|-------|----------|
| Feature-specific API | `src/features/<n>/api/` |
| Shared/cross-feature API | `src/api/` |

## Recommended Stack

- **HTTP client**: `axios` (configured in `src/lib/axios.ts`)
- **Server state**: `@tanstack/react-query` v5
- **Type safety**: Infer response types from fetcher return types

## Axios Configuration (`src/lib/axios.ts`)

```ts
import Axios, { InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }
  config.withCredentials = true;
  return config;
}

export const api = Axios.create({ baseURL: env.API_URL });

api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message;
    // show notification toast here
    return Promise.reject(error);
  }
);
```

## Fetcher Pattern

```ts
// src/features/discussions/api/get-discussions.ts
import { api } from '@/lib/axios';
import { Discussion } from '../types';

type GetDiscussionsParams = {
  page?: number;
};

export const getDiscussions = ({ page = 1 }: GetDiscussionsParams): Promise<Discussion[]> => {
  return api.get('/discussions', { params: { page } });
};
```

## Query Hook Pattern (GET)

```ts
// src/features/discussions/api/get-discussions.ts
import { useQuery, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Discussion } from '../types';

export const getDiscussionsQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: ['discussions', { page }],
    queryFn: () => api.get<Discussion[]>('/discussions', { params: { page } }),
  });

export const useDiscussions = ({ page }: { page?: number } = {}) => {
  return useQuery(getDiscussionsQueryOptions(page));
};
```

## Mutation Hook Pattern (POST/PUT/DELETE)

```ts
// src/features/discussions/api/create-discussion.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Discussion, CreateDiscussionInput } from '../types';

export const createDiscussion = (data: CreateDiscussionInput): Promise<Discussion> => {
  return api.post('/discussions', data);
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDiscussion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });
};
```

## Query Keys Convention

Use structured query keys for easy invalidation:

```ts
// Feature-level key factory
export const discussionKeys = {
  all: ['discussions'] as const,
  lists: () => [...discussionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...discussionKeys.lists(), filters] as const,
  details: () => [...discussionKeys.all, 'detail'] as const,
  detail: (id: string) => [...discussionKeys.details(), id] as const,
};
```

## Data Prefetching

Prefetch data before the user navigates to a page:

```ts
// In a route loader or on hover
await queryClient.prefetchQuery(getDiscussionsQueryOptions(1));
```

## QueryClient Setup (`src/lib/react-query.ts`)

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});
```