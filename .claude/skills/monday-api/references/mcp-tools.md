# monday MCP tools

When the monday MCP server is connected (check `/mcp`), use it to look things up and test queries. Tool names have a server prefix (e.g. `mcp__monday__all_api_read`); match them by the short name.

## Contents
- Which tool for what
- Tools to avoid or read carefully
- Version and limits

## Which tool for what

| Task | Tool | Notes |
|---|---|---|
| Test a read query | `all_api_read` | Takes `query` and `variables` (a JSON **string**). Rejects mutations before sending, so it's safe to run freely. |
| Run a mutation (after the learner confirms) | `all_monday_api` | Real write as the connected user. Show it first, note what it created. |
| Column ids, types, status/dropdown label ids, groups | `get_board_info` with `filters: { columns: { only: true } }` | One call gives everything needed to write `column_values` and filters. |
| Exact fields and arguments of one type | `get_type_details` (e.g. `"CheckboxValue"`, `"Group"`) | Small, precise answer. Use it before writing a query that uses that type. |
| Read items quickly (not for app code) | `get_board_items_page` | Handy to look at data. Its filters and limits (up to 2,000) are the tool's own, not the GraphQL API's. Write app queries with `items_page`. |
| Filter rules for a column type | `get_column_type_info` with `fetchMode: "guidelines"` | Which operators and `compare_value` shapes a column accepts. |

Errors come back as a plain message, e.g. `Cannot query field "x" on type "User".` Fix the query and run it again.

## Tools to avoid or read carefully

- **`get_graphql_schema` is too big.** The write list alone is about 100,000 characters. Use `get_type_details` on the type you need, or `grep` the schema file (see [finding-answers.md](finding-answers.md#searching-the-schema)).
- **`get_column_type_info` (default `fetchMode: "schema"`) describes column *settings*** (what you send to create or configure a column), **not the format for writing a value**. For value formats use [column-values.md](column-values.md) or the column's docs page.
- **The MCP's own write tools** (`create_item`, `create_group`, `change_item_column_values`, …) are shortcuts for doing the job directly. They don't show the GraphQL the app needs. To build app code, test the real mutation with `all_monday_api`.

## Version and limits

- **The MCP may answer on a different API version than the app.** In testing it ran on the release candidate (`query { version { kind value } }` returned `release_candidate`), while `@mondaydotcomorg/api` uses the version that matches its package. A field that works through MCP can be missing in the app, and the reverse. Check the version with that query when a field is new or recently changed.
- **MCP calls are real API calls** as the connected user. They count against the same rate limits as the app's calls.
