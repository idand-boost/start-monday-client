---
name: bulletproof-react
description: Architecture and scaffolding guide for React projects.
  Use this skill whenever the user asks to build, scaffold, create, or modify ANYTHING in a React
  project
---

# 🛡️ Bulletproof React Skill

This skill governs all React development in this project. Every React task — no matter how small —
should follow these patterns.

## Quick Decision Guide

| Task                   | Action                                               |
| ---------------------- | ---------------------------------------------------- |
| New feature            | `scaffold a new feature folder` then fill in subdirs |
| New component          | `create a new component folder` then fill in files   |
| New hook               | `create a new hook file` then fill in logic          |
| API call for a feature | Add to `features/<name>/api/`                        |
| Shared API call        | Add to `src/api/`                                    |
| Global state           | `src/stores/`                                        |
| Feature-local state    | `features/<name>/stores/`                            |
| Shared UI component    | `src/components/`                                    |
| Types for a feature    | `features/<name>/types/`                             |
| Shared types           | `src/types/`                                         |

## Reference Files

Read the relevant reference file before generating code for a specific topic:

- `references/project-structure.md` — **Read first for ANY task.** Directory layout, import rules, unidirectional architecture.
- `references/components-and-styling.md` — Component patterns, co-location, styling options.
- `references/api-layer.md` — API declarations, react-query hooks, fetcher pattern.
- `references/state-management.md` — Global state, server state, form state, local state.
- `references/testing.md` — Testing strategy, RTL, Playwright, MSW.
- `references/error-handling.md` — Error boundaries, API interceptors, Sentry.
- `references/performance.md` — Code splitting, memoization, lazy loading.
- `references/project-standards.md` — ESLint, Prettier, TypeScript, Husky, naming conventions.
- `references/security.md` — Auth, XSS, CSRF, input validation.

## Core Principles (always apply)

1. **Feature-first**: All feature code lives in `src/features/<feature-name>/`. Never scatter feature logic across the global folders.
2. **No cross-feature imports**: Features must not import from other features. Compose at the app level.
3. **Unidirectional flow**: `shared → features → app`. Shared modules never import from features.
4. **No barrel files** (`index.ts` re-exports at folder level) — import files directly to avoid Vite tree-shaking issues.
5. **TypeScript everywhere**: Type all props, API responses, and store slices.
6. **Co-locate tests**: Test files live next to the code they test (or in a `__tests__` sibling).

## Workflow for New Features

1. Read `references/project-structure.md` to confirm placement.
2. Define TypeScript types in `features/<name>/types/`.
3. Declare API functions + react-query hooks in `features/<name>/api/`.
4. Build components in `features/<name>/components/`.
5. Wire up state in `features/<name>/stores/` (if needed).
6. Export only the public surface from the feature (not via barrel — import directly at app level).
7. Add route in `src/app/routes/` if the feature needs a page.

## Workflow for New Shared Components

1. Check if it already exists in `src/components/`.
2. Read `references/components-and-styling.md` for patterns.
3. Wrap any 3rd-party components rather than using them directly.
