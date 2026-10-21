# Column values

Sources: developer.monday.com/api-reference/reference/column-types-reference.md and each column's page (`/api-reference/reference/<column>.md`, e.g. `reference/status.md`; find the URL in `llms.txt`). Check the column's page when a format here fails.

## Contents
- Writing
- Write formats by type
- Read-only columns
- Reading typed values

## Writing

`column_values` is a **JSON string** of an object keyed by **column id** (not title):

```ts
const columnValues = JSON.stringify({
  status: { label: "Done" },
  date4: { date: "2026-01-15" },
  numbers: "42",
});
```

- Set several columns in one call with `change_multiple_column_values`, or at creation with `create_item(column_values:)`.
- **To clear a column, send `null`** for it: `{ "status": null }`.
- The item name is not a column value: set it with `item_name` (on create) or the `name` key.
- Query `boards(ids: [ID]) { columns { id title type } }` to get each column's id and type first.

## Write formats by type

| Type (`type`) | Write value | Example |
|---|---|---|
| Text (`text`) | plain string | `"Sample text"` |
| Numbers (`numbers`) | number as a string | `"42.5"` |
| Status (`status`) | `{"label": ...}` or `{"index": N}` | `{"label": "Done"}` |
| Date (`date`) | `{"date": "YYYY-MM-DD"}`, optional `"time": "HH:MM:SS"` (UTC) | `{"date": "2026-06-15", "time": "09:00:00"}` |
| Timeline (`timeline`) | `{"from": ..., "to": ...}` | `{"from": "2026-03-01", "to": "2026-03-15"}` |
| Week (`week`) | `{"week": {"startDate": ..., "endDate": ...}}` | `{"week": {"startDate": "2026-03-16", "endDate": "2026-03-22"}}` |
| Hour (`hour`) | `{"hour": H, "minute": M}` | `{"hour": 16, "minute": 42}` |
| Checkbox (`checkbox`) | `{"checked": "true"}` (string) | `{"checked": "true"}` |
| Dropdown (`dropdown`) | `{"labels": [...]}` or `{"ids": [...]}` | `{"labels": ["Marketing"]}` |
| People (`people`) | `{"personsAndTeams": [{"id": N, "kind": "person" \| "team"}]}` | `{"personsAndTeams": [{"id": 48202303, "kind": "person"}]}` |
| Long text (`long_text`) | `{"text": ...}` | `{"text": "Line one\nLine two"}` |
| Link (`link`) | `{"url": ..., "text": ...}` | `{"url": "https://monday.com", "text": "Go to monday!"}` |
| Email (`email`) | `{"email": ..., "text": ...}` | `{"email": "contact@example.com", "text": "Main contact"}` |
| Phone (`phone`) | `{"phone": ..., "countryShortName": ...}` | `{"phone": "+12025550169", "countryShortName": "US"}` |
| Rating (`rating`) | `{"rating": N}` | `{"rating": 5}` |
| Tags (`tags`) | `{"tag_ids": [...]}` | `{"tag_ids": [295026]}` |
| Country (`country`) | `{"countryCode": ..., "countryName": ...}` | `{"countryCode": "US", "countryName": "United States"}` |
| Location (`location`) | `{"lat": "...", "lng": "...", "address": ...}` (lat/lng as strings) | `{"lat": "40.7128", "lng": "-74.0060", "address": "New York, NY"}` |
| World clock (`world_clock`) | `{"timezone": ...}` | `{"timezone": "Europe/London"}` |
| Color picker (`color_picker`) | `{"color": {"hex": ...}}` or `{"color": {"r", "g", "b"}}` | `{"color": {"hex": "#FF5733"}}` |
| Connect boards (`board_relation`) | `{"item_ids": [...]}`, via `change_multiple_column_values` | `{"item_ids": [1122334455]}` |
| Dependency (`dependency`) | `{"item_ids": [...]}` | `{"item_ids": ["1234567891"]}` |
| Files (`file`) | not through `column_values`: use the `add_file_to_column` mutation | |

Common mistakes:
- Passing an object instead of `JSON.stringify(...)`.
- Status as `"Done"` instead of `{"label": "Done"}`. A label that doesn't exist fails unless `create_labels_if_missing: true`.
- Numbers as `{"value": 42}` instead of `"42"`; text as `{"text": "..."}` instead of a plain string.
- Checkbox as `true` instead of `"true"`.
- People without `kind`.

## Read-only columns

Readable, never writable: formula, mirror, creation log, last updated, item id, progress tracking, auto number. Button, vote, time tracking and subitems are changed in the UI, not through `column_values`.

## Reading typed values

Every column value has `id`, `type`, `text` (display string) and `value` (raw JSON string or `null`). For typed fields, use inline fragments:

```graphql
query ($boardId: [ID!]) {
  boards(ids: $boardId) {
    items_page(limit: 50) {
      items {
        id
        name
        column_values(ids: ["status", "date4", "numbers"]) {
          id
          type
          text
          ... on StatusValue { label index }
          ... on DateValue { date time }
          ... on NumbersValue { number }
          ... on CheckboxValue { checked }
          ... on DropdownValue { values { id label } }
          ... on PeopleValue { persons_and_teams { id kind } }
          ... on BoardRelationValue { linked_item_ids }
          ... on MirrorValue { display_value }
          ... on FormulaValue { display_value }
        }
      }
    }
  }
}
```

- `column_values(ids: [...])` returns only those columns: much cheaper than all of them.
- Mirror and formula values are empty in `text`; ask for `display_value`. Formula `display_value` is limited (up to 5 formula columns per request, 10,000 values per minute).
