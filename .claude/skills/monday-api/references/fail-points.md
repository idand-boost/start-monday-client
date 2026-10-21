# Known fail points

Check every new query against this list. Error messages and how to handle them: [error-handling.md](error-handling.md). Cost and limits: [complexity-and-limits.md](complexity-and-limits.md).

## Contents
- Query shape
- Values and ids
- Board rules
- @mondaydotcomorg/api client

## Query shape

- **`items` on boards is gone.** Use `boards { items_page { cursor items { ... } } }`.
- **`next_items_page` is root-level.** Nesting it inside `boards { }` fails. Pass the cursor from the previous page.
- **`query_params` only on the first page.** It can't be combined with `cursor`.
- **A filter with the wrong `compare_value` shape returns no items, not an error.** Status and dropdown `any_of` take label ids (`[1]`), not text (`["Done"]`). See [graphql-cookbook.md](graphql-cookbook.md#filtering-and-sorting).
- **A cursor expires after 60 minutes.** Start again from `items_page`.
- **`ids` take arrays:** `boards(ids: [123])`, and the variable type is `[ID!]`.
- **Ask for `id` back from every mutation.** You usually need it for the next call (e.g. the group id to put items in).
- **Fields come and go between API versions.** If the docs show a field the schema doesn't have, check the version (see [graphql-cookbook.md](graphql-cookbook.md#api-version)).

## Values and ids

- **`column_values` is a JSON string.** Pass `JSON.stringify({...})`, not an object. Keys are **column ids**, not titles.
- **Each column type has its own format** (status `{"label": "Done"}`, numbers `"42"`, date `{"date": "YYYY-MM-DD"}`). See [column-values.md](column-values.md). Clear a column with `null`.
- **Connect boards columns** take `{"item_ids": ["123"]}` and must be written with `change_multiple_column_values`.
- **Status and dropdown labels must exist.** An unknown label fails unless you pass `create_labels_if_missing: true`.
- **Group ids are `String`; board and item ids are `ID`.** A `$groupId: ID!` variable fails for `create_item(group_id:)`.
- **Dates and times are UTC.**
- **Some columns can't be written** (formula, mirror, auto number, creation log and other calculated columns).

## Board rules

- **Item names are 1 to 255 characters.**
- **A board holds at most 10,000 items.** Code that creates items in a loop can reach it.
- **New groups appear at the top of the board.** Use `position_relative_method` and `relative_to` to place them elsewhere.
- **The last group on a board can't be deleted or archived.**
- **A board can be locked for a moment** while another process writes to it (an automation, a column change). Writes fail with HTTP 423; wait and retry. Sending your own writes one at a time avoids most of this ([complexity-and-limits.md](complexity-and-limits.md#send-writes-one-at-a-time)).

## @mondaydotcomorg/api client

- **`ApiClient.request()` returns the data. `SeamlessApiClient.request()` returns monday's whole reply,** so the fields are at `res.data.data`. `const { me } = await seamless.request(...)` gives `undefined`. Unwrap it once in a small helper that the rest of the app calls.
- **Both throw on any GraphQL error by default** (`ClientError` / `SeamlessApiClientError`). A `SeamlessApiClientError` message is always `"Graphql validation errors"`; the real reasons are in `err.response.errors`.
- **`SeamlessApiClient` only works inside monday's iframe.** In a plain browser tab it waits and rejects with `Request timed out` after 60 seconds.
- **Partial data needs `errorPolicy: 'all'`.** Without it, one failed field throws away the fields that worked.
- **The API version defaults to the one that matches the package release.** A newer field needs a package upgrade or an explicit version.
- **The monday MCP can run a different version than the app** (it answered on the release candidate in testing). A query tested through MCP can fail in the app. See [mcp-tools.md](mcp-tools.md#version-and-limits).
