# GraphQL cookbook

## Contents
- Reads: me, board structure, items
- Writes: groups, items, column values
- Column value formats
- Pagination
- Filtering and sorting
- Items of one group
- API version

All examples use variables. Send them as `{ query, variables }`.

## Reads

Who am I (the first query to try):

```graphql
query { me { id name email account { id slug } } }
```

Board structure (columns and groups, to learn their ids and types):

```graphql
query ($boardId: [ID!]) {
  boards(ids: $boardId) {
    name
    columns { id title type }
    groups { id title }
  }
}
```

Items with their values:

```graphql
query ($boardId: [ID!]) {
  boards(ids: $boardId) {
    items_page(limit: 50) {
      cursor
      items { id name group { id } column_values { id text value } }
    }
  }
}
```

`text` is the display value; `value` is the raw JSON string (or `null`).

## Writes

Create a group (returns its id, keep it to add items to it):

```graphql
mutation ($boardId: ID!, $name: String!) {
  create_group(board_id: $boardId, group_name: $name) { id title }
}
```

New groups appear at the top of the board.

Create an item in a group, with optional column values:

```graphql
mutation ($boardId: ID!, $groupId: String!, $name: String!, $columnValues: JSON) {
  create_item(board_id: $boardId, group_id: $groupId, item_name: $name, column_values: $columnValues) {
    id
    name
  }
}
```

```ts
const variables = {
  boardId: BOARD_ID,
  groupId,
  name: "Grok the Great",
  columnValues: JSON.stringify({ status: { label: "Done" }, numbers0: "150" }),
};
```

Change several columns of an existing item:

```graphql
mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
  change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $columnValues) { id }
}
```

Other common ones: `delete_item(item_id)`, `archive_item(item_id)`, `delete_group(board_id, group_id)`, `create_update(item_id, body)` (a comment on an item). Check arguments in the schema before use.

## Column value formats

`column_values` is a JSON **string** of an object keyed by **column id** (not title). The most common ones:

| Type | Value | Example |
|---|---|---|
| text | plain string | `"hello"` |
| numbers | number as a string | `"42"` |
| status | `{"label": ...}` or `{"index": N}` | `{"label": "Done"}` |
| date | `{"date": "YYYY-MM-DD"}`, optional `"time"` (UTC) | `{"date": "2026-01-15"}` |
| checkbox | `{"checked": "true"}` (string) | |

To clear a column, send `null`. Every other type, and reading typed values with fragments: [column-values.md](column-values.md).

## Pagination

`items_page` returns up to `limit` items (max 500) and a `cursor`. If `cursor` is `null`, you have everything. Otherwise call **root-level** `next_items_page`. Never nest it inside `boards`.

```graphql
query ($cursor: String!) {
  next_items_page(limit: 100, cursor: $cursor) {
    cursor
    items { id name }
  }
}
```

```ts
// `request` is whatever runs a query in this app and returns its data.
const first = await request<FirstPage>(GET_ITEMS, { boardId: [BOARD_ID] });
const items = [...first.boards[0].items_page.items];
let cursor = first.boards[0].items_page.cursor;
while (cursor) {
  const next = await request<NextPage>(GET_NEXT_ITEMS, { cursor });
  items.push(...next.next_items_page.items);
  cursor = next.next_items_page.cursor;
}
```

- `limit`: default 25, max 500.
- A cursor expires after 60 minutes.
- Keep the same fields on every page.

## Filtering and sorting

Filter and sort with `query_params` on the **first** call only (never together with `cursor`):

```graphql
query ($boardId: [ID!]) {
  boards(ids: $boardId) {
    items_page(limit: 100, query_params: {
      rules: [
        { column_id: "status", compare_value: [1], operator: any_of }
        { column_id: "date4", compare_value: ["2026-01-01", "2026-12-31"], operator: between }
      ]
      operator: and
      order_by: [{ column_id: "date4", direction: desc }]
    }) {
      cursor
      items { id name }
    }
  }
}
```

- Rule operators: `any_of` (default), `not_any_of`, `is_empty`, `is_not_empty`, `greater_than`, `greater_than_or_equals`, `lower_than`, `lower_than_or_equal`, `between`, `contains_text`, `not_contains_text`, `contains_terms`, `starts_with`, `ends_with`, `within_the_last`, `within_the_next`.
- Top-level `operator`: `and` (default) or `or`.
- **What `compare_value` takes depends on the column type.** Status and dropdown `any_of` take **label ids** (`[1]`), from `columns { id settings }` or the MCP `get_board_info`. To match by label text, use `operator: contains_terms` with a string (`compare_value: "Done"`). Check the column's docs page (`/api-reference/reference/<column>.md`, e.g. `status.md`).
- **A wrong `compare_value` shape doesn't error: it returns no items.** Tested: status `any_of` with `["Active"]` returned `[]`, with `[0]` returned the item. If a filter returns nothing, check the shape before assuming the board is empty.

Simple "items where column = value" lookups have a shortcut that takes label **text**:

```graphql
query ($boardId: ID!) {
  items_page_by_column_values(board_id: $boardId, limit: 50, columns: [{ column_id: "status", column_values: ["Done"] }]) {
    cursor
    items { id name }
  }
}
```

## Items of one group

`items_page` also exists on groups:

```graphql
query ($boardId: [ID!], $groupId: [String]) {
  boards(ids: $boardId) {
    groups(ids: $groupId) {
      items_page(limit: 100) { cursor items { id name } }
    }
  }
}
```

Continue with `next_items_page` as above.

## API version

Without a version, calls use the **Current** version (it changes every quarter). The docs describe the Current version. To see which version answered:

```graphql
query { version { kind value } versions { kind value } }
```

`@mondaydotcomorg/api` defaults to the version that matches the package release. Pin one with `new ApiClient({ token, apiVersion: "2026-07" })`, `new SeamlessApiClient("2026-07")`, or per call with `{ versionOverride: "2026-07" }`. A field added in a newer version doesn't exist until you call that version. Version list and changes: developer.monday.com/api-reference/docs/api-versioning.md.

Errors, rate limits and other fail points: [fail-points.md](fail-points.md).
