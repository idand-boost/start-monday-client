# Context and listen

Source: `https://developer.monday.com/apps/docs/mondayget.md` and `mondaylisten.md`. Check them when a field is missing: samples differ by feature and change over time.

## Contents

- Reading the context
- Fields every feature gets
- Fields by feature
- Other `get` types
- `listen` events

## Reading the context

```ts
const { data: context } = await monday.get('context')
```

Read it once at start, then keep it current with `listen`:

```ts
monday.listen('context', (res) => {
  setContext(res.data)
})
```

## Fields every feature gets

- `theme`: `"light"`, `"dark"` or `"black"`. Style the app to match.
- `user`: `id`, `isAdmin`, `isGuest`, `isViewOnly`, `countryCode`, `currentLanguage`, `timeFormat`, `timeZoneOffset`.
- `account`, `app`, `appVersion`, `region`, `subscription`, and usually `appFeature` (its `type` names the feature).

A view-only or guest user can still see the app: check `user.isViewOnly` before offering writes.

## Fields by feature

| Feature          | `instanceType` / `appFeature.type`               | Location fields                                                                        |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Board view       | `board_view` / `AppFeatureBoardView`             | `boardId`, `boardIds`, `boardViewId`, `instanceId`, `viewMode`                         |
| Item view        | `item_view`                                      | `boardId`, `boardIds`, `itemId`, `workspaceId`, `instanceId`                           |
| Dashboard widget | `dashboard_widget` / `AppFeatureDashboardWidget` | `boardIds` (several boards, no single `boardId`), `widgetId`, `editMode`, `instanceId` |
| Board item menu  | `AppFeatureItemMenuAction`                       | `boardId`, `itemId`, `pulseId`                                                         |
| Custom object    | `object_view` / `AppFeatureObject`               | `boardId`, `boardIds`, `workspaceId`                                                   |
| Doc action       | `AppFeatureAiDocQuickStart`                      | `docId`, `objectId`, `workspaceId`                                                     |

Ids can arrive as numbers. The API takes them as `ID` strings, so convert with `String(context.boardId)` before putting them in query variables.

## Other `get` types

- `monday.get('itemIds')`: the ids of the items visible on the board, after the board filter. Returns all items when no filter is set.
- `monday.get('settings')`: the values the user set in the app's settings.
- `monday.get('sessionToken')`: a signed token for a backend. See [session-token.md](session-token.md).

## `listen` events

| Event      | Fires when                                                                      |
| ---------- | ------------------------------------------------------------------------------- |
| `context`  | Any context field changes (theme, view mode, filter-related state)              |
| `settings` | The user changes a setting                                                      |
| `itemIds`  | The board filter changes which items are visible (the list may be incomplete)   |
| `events`   | Something happens on the board or dashboard, like a new item or a column change |
| `filter`   | The board filter changes. The payload has the rules and operator                |

`listen` returns a function that stops listening. Call it when the component unmounts (in React, return it from `useEffect`).
