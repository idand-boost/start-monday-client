# 🚄 Performance Reference

## Code Splitting & Lazy Loading

Lazy-load route components to keep the initial bundle small:

```tsx
// src/app/routes/index.tsx
import { lazy, Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

const DiscussionsPage = lazy(() => import('@/features/discussions/pages/discussions'));
const ProfilePage     = lazy(() => import('@/features/users/pages/profile'));

export function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/discussions" element={<DiscussionsPage />} />
        <Route path="/profile"     element={<ProfilePage />} />
      </Routes>
    </Suspense>
  );
}
```

## Memoization

Use sparingly — premature memoization adds complexity without benefit.

```tsx
// ✅ Memoize expensive derived values
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// ✅ Memoize stable callback references passed to children
const handleDelete = useCallback((id: string) => {
  deleteItem(id);
}, [deleteItem]);

// ✅ Memoize components with stable props that re-render often
const DiscussionCard = memo(function DiscussionCard({ discussion }: Props) {
  return <div>{discussion.title}</div>;
});
```

## Children Prop Optimization

The `children` prop is an isolated VDOM structure — it won't re-render when the parent re-renders:

```tsx
// ✅ Parent re-renders won't re-render ExpensiveChild when passed as children
function Layout({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      {children} {/* ← won't re-render due to count changes */}
    </div>
  );
}
```

## Lazy State Initialization

```ts
// ❌ Runs expensiveFn on every render
const [state, setState] = useState(expensiveFn());

// ✅ Runs expensiveFn only once
const [state, setState] = useState(() => expensiveFn());
```

## Data Prefetching with react-query

Prefetch data when you know navigation is likely (e.g., on hover):

```tsx
function DiscussionLink({ id }: { id: string }) {
  const queryClient = useQueryClient();

  return (
    <Link
      to={`/discussions/${id}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery(getDiscussionQueryOptions(id));
      }}
    >
      View Discussion
    </Link>
  );
}
```

## React Context Performance

Context is fine for low-velocity data. For high-velocity data:

```tsx
// ❌ Every context consumer re-renders when ANY value changes
const { user, theme, notifications } = useAppContext();

// ✅ Use separate contexts or use-context-selector
import { useContextSelector } from 'use-context-selector';
const theme = useContextSelector(AppContext, (ctx) => ctx.theme);
```

Or switch to Zustand/Jotai with selectors:

```ts
// ✅ Only re-renders when `theme` specifically changes
const theme = useAppStore((s) => s.theme);
```

## High-Frequency State: Jotai

For UIs tracking many items simultaneously (e.g., multi-select tables, real-time feeds),
use Jotai's atomic model to avoid re-rendering everything on each change.

```ts
import { atom, useAtom } from 'jotai';

const selectedIdsAtom = atom<Set<string>>(new Set());
```

## Bundle Analysis

```bash
# Vite bundle visualization
npx vite-bundle-analyzer
```

Look for: large vendor chunks, duplicate dependencies, unintentionally large routes.