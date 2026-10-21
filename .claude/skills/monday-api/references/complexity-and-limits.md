# Complexity and rate limits

Sources: developer.monday.com/api-reference/reference/complexity.md and developer.monday.com/api-reference/docs/rate-limits.md. Numbers change; check the docs if a limit matters.

## Contents
- Complexity
- Measuring a query's cost
- Reducing complexity
- The other limits
- Send writes one at a time
- Many writes at once: aliases

## Complexity

Every query and mutation has a **complexity cost**: roughly, how much data it asks monday to load. Nested lists multiply: 100 items × 20 column values costs far more than 100 item names.

| Budget | Limit |
|---|---|
| One query | 5,000,000 points. Over it: `REQUEST_MAX_COMPLEXITY_EXCEEDED` (`maxComplexityExceeded` in 2025-07 and older) |
| Per minute, app tokens (incl. inside monday) | 5M for reads and 5M for writes |
| Per minute, personal token | 10M reads and writes combined (1M on trial and free accounts) |
| Per minute, API playground | 5M each (1M on trial and free accounts) |

The per-minute budget is a sliding window that resets 60 seconds after the first call. When it runs out: `COMPLEXITY_BUDGET_EXHAUSTED` (429), with `retry_in_seconds`.

## Measuring a query's cost

Add the `complexity` field to any query or mutation:

```graphql
query ($boardId: [ID!]) {
  complexity { query before after reset_in_x_seconds }
  boards(ids: $boardId) {
    items_page(limit: 100) { items { id name column_values { id text } } }
  }
}
```

| Field | Meaning |
|---|---|
| `query` | Cost of this query |
| `before` / `after` | Budget left before and after it |
| `reset_in_x_seconds` | Seconds until the budget resets |

Test a new read with `complexity` once and tell the learner the cost. If one call costs a large share of the budget (e.g. over 1M), shrink it before it ships.

## Reducing complexity

- **Ask only for the fields you use.** Drop `column_values` if you only need names; ask for specific columns with `column_values(ids: ["status", "date4"])`.
- **Smaller pages:** use `limit` (e.g. 50 to 100) and paginate instead of one huge page.
- **Less nesting:** don't load boards → groups → items → column values → subitems in one call when you need one level.
- **Don't refetch what you have.** Keep ids (board, group, column) in a constant or memory instead of querying them before every write.

## The other limits

| Limit | Value | Error |
|---|---|---|
| Calls per minute | 1,000 (Pro 2,500, Enterprise 5,000) | `Rate Limit Exceeded` / `Minute limit rate exceeded` (429) |
| Concurrent requests | 40 (Pro 100, Enterprise 250) | `maxConcurrencyExceeded` (429) |
| Per IP | 5,000 requests per 10 seconds | `IP_RATE_LIMIT_EXCEEDED` (429) |
| Create / duplicate board, duplicate group | 40 per minute | |

- All calls count, **including failed ones**. Wait for `retry_in_seconds` (or the `Retry-After` header) before retrying.
- Every response has `RateLimit` headers (e.g. `"minuteRate";r=90, "concurrency";r=35, "complexityMinute";r=800000;t=45`). `r` is what's left; `t` is seconds until reset.

## Send writes one at a time

**Best practice:** when an app writes on events that repeat (a click, a game event, a loop over rows), don't fire one parallel request per event. Put every call through **a sequential queue built on promises**:

- One request in flight at a time: stays under the concurrency limit and avoids 423 "board locked" errors from your own writes.
- Calls run in order: an item is never created before its group.
- The caller doesn't wait: the UI or game loop keeps running.
- One failure doesn't stop the queue.

```ts
// Runs tasks one after another, in the order they were added.
// A failed task doesn't stop the ones after it.
let tail: Promise<unknown> = Promise.resolve();

export function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = tail.then(task);
  tail = run.catch(() => undefined);
  return run;
}
```

Usage, where a later call needs an earlier result:

```ts
const groupId = enqueue(() => request<CreateGroupResult>(CREATE_GROUP, { boardId, name }))
  .then((r) => r.create_group.id);

function onEvent(itemName: string) {
  enqueue(async () => request(CREATE_ITEM, { boardId, groupId: await groupId, name: itemName }))
    .catch((err) => console.warn("[monday] create_item failed:", err)); // see error-handling.md
}
```

- Never `await` the queue inside a render or an animation loop; fire and forget, and handle the error in `.catch`.
- If events come faster than the queue drains, the queue grows. Cap it (e.g. ignore events while more than 50 are waiting) or batch them (next section).
- For retries, retry **inside** the task after waiting, so the order holds.

## Many writes at once: aliases

When many writes are ready at the same time, send several mutations in **one request** with aliases. That's one call instead of ten:

```graphql
mutation ($boardId: ID!, $groupId: String!, $n0: String!, $n1: String!, $n2: String!) {
  i0: create_item(board_id: $boardId, group_id: $groupId, item_name: $n0) { id }
  i1: create_item(board_id: $boardId, group_id: $groupId, item_name: $n1) { id }
  i2: create_item(board_id: $boardId, group_id: $groupId, item_name: $n2) { id }
}
```

- Each alias still adds its own complexity. Keep batches small (about 10).
- Pass names as variables; never paste user or game text into the query string.
- One failing alias doesn't undo the others: check `errors[].path` to see which failed.
- Build batches from the queue: collect for about a second, then `enqueue` one aliased mutation.
