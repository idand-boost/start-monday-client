# ⚙️ Project Standards Reference

## ESLint

Configure in `.eslintrc.js` (or `eslint.config.js` for flat config):

```js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // Enforce import boundaries (see project-structure.md for full config)
    'import/no-restricted-paths': ['error', { zones: [ /* ... */ ] }],

    // Prefer named exports
    'import/no-default-export': 'error',

    // Enforce file naming: kebab-case
    // (handled via eslint-plugin-filename-rules or similar)

    // No unused variables
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

## Prettier

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Enable **format on save** in your IDE. Prettier handles all style decisions — don't fight it.

## TypeScript

`tsconfig.json` recommendations:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Always type:**
- Component props (use `type`, not `interface` for props)
- API response shapes
- Store state
- Hook return values when non-obvious

**When refactoring**, update types first — TypeScript errors will guide you to every call site.

## Husky + lint-staged

Pre-commit hooks ensure nothing broken gets committed:

```bash
# Install
yarn add -D husky lint-staged
npx husky init

# .husky/pre-commit
npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

## Path Aliases

Use `@/` as the alias for `src/` to avoid deeply nested relative imports:

```ts
// ❌ Hard to read and refactor
import { Button } from '../../../components/ui/button';

// ✅ Clean and refactor-safe
import { Button } from '@/components/ui/button';
```

Configure in both `tsconfig.json` and `vite.config.ts`:

```ts
// vite.config.ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Naming Conventions Summary

| Artifact | Convention | Example |
|---------|-----------|---------|
| Files | `kebab-case` | `user-profile.tsx` |
| Folders | `kebab-case` | `user-settings/` |
| Components | `PascalCase` export | `export function UserProfile` |
| Hooks | `camelCase` with `use` prefix | `useDisclosure` |
| Types/Interfaces | `PascalCase` | `type UserProfile = ...` |
| Constants | `SCREAMING_SNAKE_CASE` | `const MAX_RETRIES = 3` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleDelete` |
| Boolean props | `is/has/can` prefix | `isLoading`, `hasError` |

## Absolute Import Order (ESLint import/order)

Enforce this import order:
1. React / framework
2. 3rd-party libraries
3. `@/` internal imports
4. Relative imports

```ts
import { useState } from 'react';           // 1. React
import { useQuery } from '@tanstack/react-query'; // 2. 3rd party
import { Button } from '@/components/ui/button';   // 3. Internal absolute
import { useDiscussion } from './use-discussion';   // 4. Relative
```