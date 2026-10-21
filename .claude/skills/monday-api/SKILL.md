---
name: monday-api
description: Build and test monday.com GraphQL queries and mutations, starting from the API docs and schema to see what is possible. Use when the user wants to read or change monday boards, groups, items, columns or users, mentions the monday API, GraphQL, rate limits or @mondaydotcomorg/api, or a monday query returns an error.
argument-hint: '<Build a query | can I do this with the API>'
---

# monday API

Take a feature from idea to a working, tested query against the monday GraphQL API (`https://api.monday.com/v2`). Work with the learner: explain each step in a sentence, and show the query before it runs.

## Ground rules

- **Reads run freely. Writes are confirmed.** Before running a mutation yourself, show it with its variables and ask. Note anything you created so the learner can delete it.
- Use GraphQL variables, never string-built queries. Ask only for the fields you need: every field costs complexity.
- Look it up, don't guess. Field and argument names change between API versions; the schema is the truth. **Most of the time, start from the docs** (step 1), not from the cookbook or from memory: the API has more than the cookbook shows.

## Workflow

Copy this checklist and work through it:

```
- [ ] 1. Is it possible? Search the docs for what the API offers, then find the query or mutation
- [ ] 2. Get the ids it needs
- [ ] 3. Build it from what the docs say (cookbook for simple examples, column values, pagination)
- [ ] 4. Test it and show the real response
- [ ] 5. Fail points and error handling
```

### 1. Is it possible?

Find the exact query or mutation and its required arguments before writing code. **Go to the docs most of the time, and do it first, even for tasks that look simple.** Don't assume the API can't do something, or that you have to loop and add things up yourself: the docs may list a purpose-built query (for example a native `aggregate` query for totals) that this skill doesn't mention. Read the reference page for every query or mutation you plan to use. Docs pages are available as plain text: add `.md` to the end of the URL (e.g. `https://developer.monday.com/api-reference/reference/complexity.md`). Start from the index of every page, `https://developer.monday.com/api-reference/llms.txt`, and take page URLs from it (guessed URLs can redirect to a 1 MB HTML page). Check names and argument types in the schema. Tell the learner where they can look themselves: the docs, the **API playground** in the Developer Center, and **Dev Sidekick** (the AI assistant in the Developer Center top bar). How to search the schema: [references/finding-answers.md](references/finding-answers.md).

If the API can't do it, say so plainly and offer the closest alternative.

### 2. Ids

Boards come from the URL (`/boards/<id>`), items from `/pulses/<id>`, workspaces from `/workspaces/<id>`. Column and group ids need **developer mode** (monday.labs) or a query. Column ids are not the column titles. See [references/finding-answers.md](references/finding-answers.md#ids).

### 3. Build

Build from what you found in the docs in step 1. [references/graphql-cookbook.md](references/graphql-cookbook.md) is only for the **simple examples**: basic reads, `create_group`, `create_item`, pagination, filtering, API version. If the task is not in the cookbook, that is normal: go back to the docs and the schema, not to a guess. Write and read formats for every column type: [references/column-values.md](references/column-values.md).

Keep complexity low: ask only for the fields you use, and add the `complexity` field when testing a new read. If the app writes many times (on repeated events, or in a loop), send the calls through a **sequential queue built on promises**, never one parallel request each. Both: [references/complexity-and-limits.md](references/complexity-and-limits.md).

### 4. Test

Use the first option available:

1. **monday MCP tools**, if connected (`/mcp`): reads with `all_api_read`, confirmed writes with `all_monday_api`, board structure with `get_board_info`. Which tool for what, and which to avoid: [references/mcp-tools.md](references/mcp-tools.md).
2. **The app's own API client**, if the project already has a way to run queries locally.
3. **The API playground**: give the learner the query and the variables JSON to paste, and ask them for the result.

Show the response shape before writing code that depends on it.

### 5. Fail points

Check the query and the code that calls it against [references/fail-points.md](references/fail-points.md).

Every call needs error handling: monday returns most errors with HTTP 200, in an `errors` array. Catch, log the error `code` and `message`, keep the app running, and retry only rate limit, lock and server errors, after waiting. When a query fails, look up the error in [references/error-handling.md](references/error-handling.md).

## Done means

- The query was found in the docs or schema, not guessed or copied blindly from the cookbook.
- It was tested and the learner saw the real response.
- The calling code handles errors, and repeated writes go through the queue.
- The cost is known (`complexity`) for new reads.
