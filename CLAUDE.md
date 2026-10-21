# start-monday-client

A frontend-only monday.com app (board view, item view...). It runs inside monday as an iframe, and in a plain browser tab during `npm run dev` with a mocked SDK.

Stack: React 19, Vite, TypeScript, TanStack Router (file-based) + TanStack Query, shadcn/ui + Tailwind v4, `monday-sdk-js`, `@mondaydotcomorg/api`, Vitest.

## Commands

- `npm run dev`: http://localhost:5173 (fixed port: Developer Center features point at it)
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run format`
- `npm run build`: also runs `scripts/check-dist.mjs`, which fails if a secret or dev-only code is in `dist/`

## Skills

Load the matching skill before the work:

- `/monday-sdk`: context, `monday.execute`, storage, mocking
- `/monday-api`: GraphQL queries and mutations, errors, rate limits
- `/mapps-cli`: deploy, versions, `mapps code:push`
- `/tanstack`: routes, loaders, queries
- `/bulletproof-react`: where code goes. This project doesn't have the `bpr` CLI: create files by hand.

## Where things go (bulletproof-react)

- `src/app/`: providers, router, routes (`src/app/routes/`, file-based). Every screen lives under the pathless `_app` route, which runs the access check first.
- `src/features/<name>/{api,components,...}`: one folder per feature. **Features never import each other**; compose them in `src/app/routes`. ESLint enforces it.
- Shared code: `src/components` (`ui/` is shadcn), `src/lib`, `src/hooks`, `src/config`, `src/utils`, `src/types`. Shared code never imports features or app.
- kebab-case file names, no barrel `index.ts` files, tests next to the code (`*.test.ts(x)`).

## monday rules

- **Two worlds.** `isInsideMonday` (`src/lib/monday/environment.ts`) is decided once. Never call `mondaySdk()` outside `src/lib/monday/sdk.ts`; use `monday`, `getContext`, `onContextChange`, `globalStorage`/`instanceStorage` from there. In a plain tab, `monday` is the mock in `mock-sdk.ts`: when you use a new SDK call, teach the mock to answer it.
- **Context in components:** `useMondayContext()`. In route loaders, read `context.monday`. Board/item screens render from loader data, so they never show an id before it is loaded.
- **Every API call** goes through `mondayRequest()` (`src/lib/monday/client.ts`). It queues calls one at a time and retries only what can recover (`src/lib/monday/queue.ts`, `errors.ts`). TanStack Query's own retry stays off.
- **New GraphQL operation:** add it to `src/lib/monday/operations.ts` and to `ALLOWED_OPERATIONS`, or the dev endpoint refuses it. Wrap it in the feature's `api/` folder as a fetcher plus `queryOptions` with a key under `MONDAY_QUERY_KEY`.
- **Token safety:** `MONDAY_API_TOKEN` (no `VITE_` prefix) lives only in `.env` and is read only by `vite-plugins/monday-dev-api.ts`. Never put a token in `VITE_*`, in code, or in a commit. `src/config/env.ts` is dev-only.
- **Messages to the user:** `notify()` (`src/lib/monday/notify.ts`): a monday notice inside monday, a toast in a plain tab. Show `toUserMessage(error)`, never raw errors.
- **Access:** guests and view-only users are blocked in `src/features/access`. They have no API access.
- **Backend (track 3):** `getSessionToken()` / `getBackendUrl()` (`src/lib/monday/session.ts`) and `backendFetch()` (`src/lib/api-client.ts`).

## When planning a change

In your plan, list each kind of failure and what the app does about it (no token, rate limit, wrong view, missing permission, network down).
