# execute and set

Source: `https://developer.monday.com/apps/docs/mondayexecute.md` and `mondayset.md`. `execute` has many more actions (docs, files, modals, plan selection): check the docs for anything not listed here.

## Contents

- Common `execute` actions
- `set`
- Neither can be mocked

## Common `execute` actions

`monday.execute(type, params)` returns a promise.

| Action                           | Params                                                                                                     | What happens                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `openItemCard`                   | `itemId` (number, required), `kind`: `"columns"` (default) or `"updates"`                                  | The item card opens in monday, like clicking the item              |
| `notice`                         | `message` (required), `type`: `"success"`, `"error"` or `"info"` (default), `timeout` in ms (default 5000) | A message at the top of monday                                     |
| `confirm`                        | `message` (required), `confirmButton`, `cancelButton`, `excludeCancelButton`                               | A yes or no dialog. Resolves with `res.data.confirm` true or false |
| `openLinkInTab`                  | `url` (required)                                                                                           | Opens a link in a new browser tab                                  |
| `openCreateItemDialog`           | `boardId` or `boardIds`                                                                                    | monday's own "new item" dialog                                     |
| `openAppFeatureModal`            | `urlPath`, `urlParams`, `width`, `height`                                                                  | Opens your app in a modal. Use a relative `urlPath`                |
| `openSettings` / `closeSettings` | none                                                                                                       | Opens or closes the app's settings panel                           |
| `valueCreatedForUser`            | none                                                                                                       | Tells monday the user just got value from the app                  |

```ts
await monday.execute('openItemCard', { itemId: Number(alien.itemId) })

monday.execute('notice', { message: 'New high score!', type: 'success', timeout: 4000 })

const { data } = await monday.execute('confirm', { message: 'Start a new round?' })
if (data.confirm) startRound()
```

To open an item card, the app needs the item's id. Keep the `id` that `create_item` returns, instead of searching for the item later.

## `set`

| Type       | Params                                    | What happens                                                       |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `settings` | An object of settings field ids to values | Saves the app's settings for the user who installed it             |
| `location` | `{ query: { ... } }`                      | Sets query params in the app's URL inside monday (`?app[foo]=bar`) |

```ts
await monday.set('settings', { difficulty: 'hard' })
```

## Neither can be mocked

`execute` and `set` change the monday page itself, so there is nothing to fake them with in a plain browser tab. In the mock, log the call and its params, and resolve with a harmless value (`confirm` resolves `true` so flows can continue). Tell the learner to check these inside monday.
