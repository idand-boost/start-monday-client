---
name: monday-sdk
description: Use the monday client SDK (monday-sdk-js) inside a monday app feature, such as a board view, item view or dashboard widget, to read the context, listen for changes, run monday actions like openItemCard or notice, keep data in the Storage API, and mock the SDK in a plain browser tab. Use when the user wants the app to know which board, item or user it is on, replace a hardcoded board id, save data between renders or cache results, open item cards or show messages in monday, get a sessionToken for a backend, or mentions monday-sdk-js, mondaySdk, monday.get, monday.listen, monday.execute, monday.storage or monday.set.
argument-hint: '<Use context | storage | execute | mock the sdk>'
---

# monday SDK

The SDK is how an app talks to **the monday page around it**: where it is, what changed, and what monday should do. Data (boards, groups, items) stays with the API: use the project's `@mondaydotcomorg/api` client (`SeamlessApiClient`) and the `/anthropic-skills:monday-api` skill for queries. Explain each step to the learner in a sentence.

## Ground rules

- **Docs first.** Check the exact method and parameters before writing code. Docs pages are plain text with `.md` at the end, and the index of all pages is `https://developer.monday.com/apps/llms.txt`. Start from `introduction-to-the-sdk.md`, `mondayget.md`, `mondaylisten.md`, `mondayexecute.md`, `mondaystorage.md` and `mondayset.md` under `https://developer.monday.com/apps/docs/`. `execute` has many more actions than this skill lists.
- **Never hardcode where the app is.** No board ids, item ids or user ids in code or `.env`: read them from the context. The one exception is a test board id that only the plain-tab mock reads.
- **One SDK instance.** Create it once in its own module (`const monday = mondaySdk()`) and import it everywhere. Wrap the calls the app uses in small functions, so the mock can replace them in one place.
- **The SDK only works inside monday's iframe.** In a plain browser tab its promises may never resolve. Always detect the environment and switch to mocks (step 4).

## Quick start

```bash
npm i monday-sdk-js
```

```ts
import mondaySdk from 'monday-sdk-js'

export const monday = mondaySdk()

const { data: context } = await monday.get('context')
const boardId = context.boardId
```

## Workflow

Copy this checklist and work through it:

```
- [ ] 1. Which feature is this? Read what its context gives you
- [ ] 2. Pick the SDK tool for each need
- [ ] 3. Storage: pick instance or global, save with versions
- [ ] 4. Mock what can be mocked for a plain browser tab
- [ ] 5. Test in both worlds
```

### 1. The feature decides the context

A board view gets `boardId`. An item view gets `boardId` and `itemId`. A dashboard widget gets `boardIds`, never a single `boardId`. Check `instanceType` before trusting a field. Re-read the context on `monday.listen('context', ...)`, because the theme, filters and view mode change while the app runs. The full field list for each feature and the `listen` events: [references/context-and-listen.md](references/context-and-listen.md).

### 2. Pick the tool

| Need                                                                       | Tool                                               |
| -------------------------------------------------------------------------- | -------------------------------------------------- |
| Where am I, who is looking, which items are visible                        | `monday.get('context' \| 'itemIds' \| 'settings')` |
| React to changes (theme, filter, new items)                                | `monday.listen(...)`                               |
| Make monday do something: open an item card, show a message, ask yes or no | `monday.execute(...)`                              |
| Keep data between renders, or cache expensive API results                  | `monday.storage`                                   |
| Change the app's settings or its URL                                       | `monday.set(...)`                                  |
| Prove to a backend who the user is                                         | `monday.get('sessionToken')`                       |

Actions and their parameters: [references/execute-and-set.md](references/execute-and-set.md). Backend identity: [references/session-token.md](references/session-token.md).

### 3. Storage

Instance storage (`monday.storage.instance`) belongs to one feature on one board and resets on a new major version. Global storage (`monday.storage`) is shared by the whole app in the account and survives new versions. Values are strings, so `JSON.stringify` them. Save with the `version` from `getItem` so two users don't silently overwrite each other, and check `res.data.success`. Limits, versions and the cache pattern: [references/storage.md](references/storage.md).

### 4. Mock for a plain browser tab

| SDK part         | In a plain tab                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `get('context')` | Mock with fixed test values (a test board id, a user, a theme)                                       |
| `storage`        | Mock with `localStorage`, same keys and return shape                                                 |
| `api` queries    | Use the project's existing dev path (the Vite dev endpoint with the token)                           |
| `execute`, `set` | **Can't be mocked.** Log what would have happened, and keep the app running                          |
| `sessionToken`   | **Can't be mocked** as a real token. Use a clearly fake value, and never accept it on a real backend |

A ready-made module to adapt: [references/mocking.md](references/mocking.md).

### 5. Test in both worlds

Inside monday: the context is real, actions open real cards, and storage persists. In a plain tab: the app starts on mocks without hanging, and every `execute` shows up in the Console. Tell the learner what can only be checked inside monday.

## Done means

- No hardcoded board, item or user ids. The context drives them, and the code checks which feature it is in.
- Storage uses the right level, `JSON.stringify`s its values, saves with versions and checks `success`.
- The app runs in a plain tab on mocks, and `execute` and `set` log there instead of failing.
- The learner knows which parts only work inside monday.
