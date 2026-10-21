# setup-combined-devtools: Use Combined TanStack Devtools Panel

## Priority: MEDIUM

## Explanation

Use `@tanstack/react-devtools` + `@tanstack/devtools-vite` to render a single unified panel for all TanStack libraries instead of mounting separate `<TanStackRouterDevtools>` and `<ReactQueryDevtools>` widgets. The Vite plugin handles DEV-only code stripping automatically — no manual `import.meta.env.DEV` guards needed on the Vite plugin itself.

## Bad Example

```tsx
// __root.tsx — two separate widgets, more DOM noise
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function RootLayout() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </>
  )
}
```

## Good Example

```bash
npm install @tanstack/react-devtools @tanstack/devtools-vite
```

```ts
// vite.config.ts
import { devtools } from '@tanstack/devtools-vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ ... }),
    react(),
    devtools(), // strips itself in production builds
  ],
})
```

```tsx
// routes/__root.tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/router-devtools'

function RootLayout() {
  const { queryClient } = Route.useRouteContext()
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {import.meta.env.DEV && (
        <TanStackDevtools
          plugins={[
            { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
            { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
          ]}
        />
      )}
    </QueryClientProvider>
  )
}
```

## Context

- Use `*Panel` variants (not the standalone widget variants) as plugin `render` values
- Add more plugins as you adopt other TanStack libraries (e.g. TanStack Table)
- The `devtools-vite` plugin is required for the combined panel to work in Vite projects
- Docs: https://tanstack.com/devtools/latest/docs/quick-start
