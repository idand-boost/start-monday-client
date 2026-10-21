# Finding answers

## Contents
- Where answers live
- Reading the docs as text
- Searching the schema
- Ids

## Where answers live

| Place | Use it for |
|---|---|
| **API docs**: developer.monday.com/api-reference | Every query, mutation and column type, with examples. Start here for "is this possible?". |
| **Docs index for agents**: `https://developer.monday.com/api-reference/llms.txt` | A list of every docs page with a one-line summary. Find the page here, then fetch it. |
| **API playground**: Developer Center → API playground | Run a query as yourself and see the real response. Has autocomplete and a schema explorer. |
| **Dev Sidekick**: AI assistant in the Developer Center top bar | Ask in plain words ("how do I create a group?") and get a query to try. Check its answer in the playground. |
| **Schema**: `https://api.monday.com/v2/get_schema?format=sdl` | The full schema as text. Public, no token. Search it with `grep`. |
| **Introspection**: `__type` queries (below) | Exact arguments and fields of one type, through any client. |

To open the Developer Center: profile picture → **Developers**.

## Reading the docs as text

Most docs pages are available as plain markdown: add `.md` to the end of the URL.

```bash
curl -sL https://developer.monday.com/api-reference/llms.txt | grep -i "group"
curl -sL https://developer.monday.com/api-reference/reference/groups.md
```

Prefer the `.md` version over the web page: it's smaller and has the full examples.

**Take URLs from `llms.txt`, don't guess them.** Some old paths redirect to the full HTML page (over 1 MB) even with `.md`: `/api-reference/docs/status.md` is HTML, `/api-reference/reference/status.md` is markdown. Column pages live under `/reference/`. If the response starts with `<!DOCTYPE html>`, look the page up in `llms.txt`.

## Searching the schema

Quick search without a token:

```bash
curl -s 'https://api.monday.com/v2/get_schema?format=sdl' -o /tmp/monday-schema.graphql
grep -n -A12 '^  create_group(' /tmp/monday-schema.graphql
```

If that endpoint doesn't respond, use `get_type_details` from the monday MCP ([mcp-tools.md](mcp-tools.md)), or introspection through the playground:

```graphql
query { __type(name: "Mutation") { fields { name } } }
```

```graphql
query {
  __type(name: "Item") {
    fields { name type { name kind ofType { name kind } } }
  }
}
```

For mutation arguments, ask for `fields { name args { name type { name kind ofType { name kind } } } }` on `Mutation` and pick the one you need. `NON_NULL` means the argument is required.

Rules of thumb that save a search:
- Board items: use `items_page`, not the old `items` field on boards.
- `ids` arguments take arrays: `boards(ids: [123])`.
- `column_values` arguments take a **JSON string**, not an object.
- A field that isn't in the schema version you call doesn't exist for you, even if a blog post shows it.

## Ids

| Id | Where to find it |
|---|---|
| Board | The URL: `https://<account>.monday.com/boards/1234567890` → `1234567890` |
| Item | The URL when an item is open: `/pulses/<id>` |
| Workspace | The URL: `/workspaces/<id>` |
| Column | Developer mode, then the column menu shows its id. Or query `boards(ids: [ID]) { columns { id title type } }` |
| Group | Developer mode, then the group menu. Or query `boards(ids: [ID]) { groups { id title } }` |
| User (me) | `query { me { id name } }` |
| Account | `query { me { account { id slug } } }` |

**Developer mode**: profile picture → **monday.labs** → turn on **Developer mode**. The page reloads and ids appear next to columns, groups and other items.

Types to remember: board, item and workspace ids are `ID` (send them as strings or numbers). Group ids are `String` (e.g. `"topics"`, `"new_group12345"`). Column ids are strings like `status`, `date4`, `text_mkx1abcd`.

A hardcoded board id is fine for learning. Put it in one constant (`const BOARD_ID = "1234567890"`) so it's easy to change later, e.g. to the board the app view is open on.
