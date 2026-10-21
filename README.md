# start-monday-client

Your starting point for monday.com client apps.

Everything that is already wired:

- **The SDK in two worlds.** It reads monday's context, sends notices and uses storage. Inside monday it uses the real SDK; in a plain browser tab a mock stands in.
- **The API without leaking a token.** Inside monday it uses `SeamlessApiClient`. In `npm run dev`, a dev-only endpoint keeps your token on your machine.
- **A request queue with retries.** It sends one call at a time and waits out rate limits, locked boards and network errors.
- **A route per feature.** `/board` for a Board view, `/item` for an Item view.
- **Members only.** Guests and view-only users are told up front that they can't use the app.
- **Deploy.** `npm run deploy`, or push to main and let GitHub Actions do it.
- **Skills for Claude** in `.claude/skills`: monday-sdk, monday-api, mapps-cli, tanstack, bulletproof-react.

Stack: React, Vite, TypeScript, TanStack Router + Query, shadcn/ui, Tailwind, Vitest.

## Make it yours

This is a template: make your own copy, don't clone it. This creates a new repository on your GitHub, with its own history, and downloads it:

```bash
gh repo create my-monday-app --template idand-boost/start-monday-client --private --clone
cd my-monday-app
```

Or click **Use this template** at the top of this page. With `git clone`, your pushes would go to the template instead of your app.

## Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. You're in a plain browser tab, so the SDK is mocked.

- The **Mock** controls in the header choose what the mock pretends: the view (board, item, none), the user (member, guest, view-only) and the theme.
- To read real data, fill in `.env`:
  - `MONDAY_API_TOKEN`: your token, from avatar > Developers > My access tokens.
  - `VITE_DEV_BOARD_ID` and `VITE_DEV_ITEM_ID`: a test board and item.

  Then restart `npm run dev`.

## Run it inside monday

1. In the [Developer Center](https://monday.com/developers/apps), create an app.
2. Add a **Board view** feature. Choose external hosting and set its URL to `http://localhost:5173/board`.
3. Add an **Item view** feature with `http://localhost:5173/item`.
4. Under **OAuth & Permissions**, add the scopes `me:read` and `boards:read`.
5. Install the app, add the board view to a board, and open the item view from an item.

Inside monday the mock controls disappear. monday's own context decides the board, the item, the user and the theme.

## Deploy

By hand:

```bash
npm run build
MONDAY_APP_ID=123 MONDAY_APP_VERSION_ID=456 npm run deploy
```

Then point each feature at the client-side code on monday code, keeping the same paths (`/board`, `/item`), and promote the version.

With GitHub Actions (`.github/workflows/deploy.yml`):

1. In your repository, go to **Settings > Secrets and variables > Actions**.
2. Add the variables `MONDAY_APP_ID` and `MONDAY_APP_VERSION_ID`.
3. Add the secret `MONDAY_TOKEN`.

From then on, every push to main ships. Until `MONDAY_APP_ID` is set, the deploy workflow is skipped. `ci.yml` checks every pull request.

## Where things are

| What                                       | Where                                                              |
| ------------------------------------------ | ------------------------------------------------------------------ |
| Routes (one per feature)                   | `src/app/routes/`                                                  |
| Features (board, item, greeting, access…)  | `src/features/`                                                    |
| SDK, mock, context, notices                | `src/lib/monday/sdk.ts`, `mock-sdk.ts`, `context.tsx`, `notify.ts` |
| API client, queue, retries, error messages | `src/lib/monday/client.ts`, `queue.ts`, `errors.ts`                |
| GraphQL operations (+ the dev allowlist)   | `src/lib/monday/operations.ts`                                     |
| Dev-only API endpoint                      | `vite-plugins/monday-dev-api.ts`                                   |
| Session token and backend URL              | `src/lib/monday/session.ts`, `src/lib/api-client.ts`               |
| Rules for Claude                           | `CLAUDE.md`, `.claude/skills/`                                     |

## Scripts

| Script                    | Does                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `npm run dev`             | Dev server on port 5173                                      |
| `npm run build`           | Type-check, build to `dist/`, then check `dist/` for secrets |
| `npm test`                | Vitest                                                       |
| `npm run lint` / `format` | ESLint (including the import rules) / Prettier               |
| `npm run deploy`          | `mapps code:push` of `dist/`                                 |
