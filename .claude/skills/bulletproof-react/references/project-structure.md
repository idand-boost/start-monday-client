# 🗄️ Project Structure Reference

## Top-Level `src/` Layout

```
src/
├── app/                  # Application layer
│   ├── routes/           # Route definitions (or pages/ for Next.js)
│   ├── app.tsx           # Root component
│   ├── provider.tsx      # Global providers (QueryClient, Router, Auth, Theme…)
│   └── router.tsx        # Router configuration
│
├── assets/               # Static files: images, fonts, icons
│
├── components/           # Shared UI components used across the whole app
│
├── config/               # Global config + exported env variables
│
├── features/             # ⭐ Feature-based modules — most code lives here
│
├── hooks/                # Shared hooks used across the entire app
│
├── lib/                  # Pre-configured 3rd-party library instances (axios, queryClient…)
│
├── stores/               # Global state stores (Zustand, Jotai, Redux…)
│
├── testing/              # Test utilities, mocks, test helpers
│
├── types/                # Shared TypeScript types and interfaces
│
└── utils/                # Shared utility/helper functions
```

## Feature Folder Structure

Each feature lives entirely in `src/features/<feature-name>/`:

```
src/features/awesome-feature/
├── api/          # API request functions + react-query hooks for this feature
├── assets/       # Static files specific to this feature
├── components/   # Components used only within this feature
├── hooks/        # Hooks scoped to this feature
├── stores/       # State stores for this feature
├── types/        # TypeScript types for this feature
└── utils/        # Utility functions for this feature
```

> **NOTE**: Not all subdirs are required. Only create what the feature actually needs.
> Use `bpr create feature <name>` with the appropriate `--with-*` flags.

## Import Rules (Unidirectional Architecture)

```
shared (components, hooks, lib, types, utils)
         ↓  can import from ↑
     features/
         ↓  can import from ↑
         app/
```

**Rules:**
- ✅ `app/` can import from `features/` and shared modules
- ✅ `features/` can import from shared modules (`components`, `hooks`, `lib`, `types`, `utils`)
- ❌ `features/` CANNOT import from `app/`
- ❌ `features/A` CANNOT import from `features/B` (no cross-feature imports)
- ❌ Shared modules CANNOT import from `features/` or `app/`

## Enforcing with ESLint

Add these rules to `.eslintrc.js` to enforce architecture automatically:

```js
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      // No cross-feature imports
      { target: './src/features/auth',        from: './src/features', except: ['./auth'] },
      { target: './src/features/users',       from: './src/features', except: ['./users'] },
      // Add a zone per feature...

      // Enforce unidirectional flow
      { target: './src/features',             from: './src/app' },
      {
        target: ['./src/components', './src/hooks', './src/lib', './src/types', './src/utils'],
        from: ['./src/features', './src/app'],
      },
    ],
  },
],
```

## Naming Conventions

- **Files/folders**: `kebab-case` (e.g., `user-profile.tsx`, `use-auth.ts`)
- **Components**: `PascalCase` export (e.g., `export function UserProfile()`)
- **Hooks**: `camelCase` starting with `use` (e.g., `useDisclosure`)
- **Types/Interfaces**: `PascalCase` (e.g., `type UserProfile = ...`)
- **Constants**: `SCREAMING_SNAKE_CASE`

## No Barrel Files

Do **not** create `index.ts` files that re-export everything from a folder.
Import directly from the file instead:

```ts
// ❌ Avoid
import { UserCard } from '@/features/users';

// ✅ Prefer
import { UserCard } from '@/features/users/components/user-card';
```

This avoids Vite tree-shaking issues and performance regressions.

## Composing Features at the App Level

When two features need to interact, wire them together in `src/app/` — never import between features:

```tsx
// src/app/routes/dashboard.tsx
import { UserWidget } from '@/features/users/components/user-widget';
import { PostList }   from '@/features/posts/components/post-list';

export function DashboardPage() {
  return (
    <div>
      <UserWidget />
      <PostList />
    </div>
  );
}
```