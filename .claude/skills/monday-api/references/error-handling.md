# Error handling

Source: developer.monday.com/api-reference/docs/error-handling.md

## Contents
- What an error looks like
- Handling errors in code
- When to retry
- Error codes → fixes

## What an error looks like

- **Most errors come back with HTTP 200.** The body has an `errors` array. Always check it, not just the status.
- **Transport errors** use real statuses: 400 (bad request), 401, 403, 404, 409, 423 (board locked), 429 (rate limits), 500.
- **Partial data:** a reply can hold both `data` and `errors`. Fields that failed are `null`.
- Each error has a `message` and usually `extensions.code` (e.g. `ColumnValueException`) and `extensions.status_code`.
- **`extensions.request_id`** identifies the call. Quote it when asking monday support.
- Rate limit errors include **`retry_in_seconds`**, and responses include a **`Retry-After`** header.

```json
{
  "data": { "me": { "id": "4012689", "photo_thumb": null } },
  "errors": [
    {
      "message": "Photo unavailable.",
      "path": ["me", "photo_thumb"],
      "extensions": { "code": "ASSET_UNAVAILABLE" }
    }
  ]
}
```

## Handling errors in code

Every API call can fail. Wrap each call, read the real messages, and decide whether the app keeps going:

```ts
import { ClientError, SeamlessApiClientError } from "@mondaydotcomorg/api";

type MondayError = { message: string; extensions?: { code?: string; retry_in_seconds?: number } };

// Pull monday's own errors out of either client's exception.
export function mondayErrors(err: unknown): MondayError[] {
  if (err instanceof ClientError) return (err.response.errors as MondayError[] | undefined) ?? [];
  if (err instanceof SeamlessApiClientError) return (err.response.errors as MondayError[] | undefined) ?? [];
  return [];
}

try {
  await client.request(CREATE_ITEM, variables);
} catch (err) {
  const errors = mondayErrors(err);
  const reason = errors.length ? errors.map((e) => `${e.extensions?.code ?? ""} ${e.message}`).join("; ") : String(err);
  console.warn("[monday] create_item failed:", reason);
  // Decide: show a message, skip this write, or retry (see below). Don't crash the app.
}
```

Rules:
- **Log `code` and `message`, not just "failed".** The code says what to fix.
- **A failed write must not break the app's main flow.** Log it, show something small if the user needs to know, and keep going.
- **Want the fields that worked?** Set `errorPolicy: 'all'` and read `errors` yourself (with `ApiClient`, use `rawRequest()` to see them).
- **Never show raw error objects to end users.** Show a short message; log the details.

## When to retry

Retry only errors that go away on their own, and **always wait first**:

| Retry? | Errors |
|---|---|
| Yes, after `retry_in_seconds` / `Retry-After` | `COMPLEXITY_BUDGET_EXHAUSTED`, `Rate Limit Exceeded`, `maxConcurrencyExceeded`, `IP_RATE_LIMIT_EXCEEDED` (429) |
| Yes, after a short delay (1 to 2 s) | Board locked (423), `Internal Server Error` (500), network errors, `Request timed out` |
| Yes, after the outage | `API_TEMPORARILY_BLOCKED` (check status.monday.com) |
| **No: fix the query** | Everything else: validation, `ColumnValueException`, invalid ids, permission errors, parse errors |

- Failed calls still count against the limits, so a retry loop without a wait makes things worse.
- Cap retries (e.g. 3 attempts) and give up with a logged error.
- **Retrying a mutation can create duplicates.** Pass an `idempotencyKey` (same key for every attempt of the same write); both clients send it as the `Idempotency-Key` header:
  ```ts
  const key = crypto.randomUUID();
  await apiClient.request(CREATE_ITEM, variables, { idempotencyKey: key }); // reuse `key` on retry
  ```
  A 409 `IDEMPOTENCY_CONFLICT` means the first attempt is still running: wait `Retry-After`.

## Error codes → fixes

| Error | Usual cause | Fix |
|---|---|---|
| `Parse error on ...` | Broken query string | Close every bracket and string; use variables |
| `Field 'x' doesn't exist on type 'y'` | Wrong field, or a field from another API version | Check the schema |
| `Argument 'x' on Field 'y' has an invalid value` | Wrong type: object instead of JSON string, `ID` vs `String` | `JSON.stringify` column values; match the schema's types |
| `Variable '$x' of type 'A' used in position expecting 'B'` | Variable type differs from the argument | Copy the type from the schema (e.g. `String` for `group_id`) |
| `InvalidArgumentException` | Typo in an argument, page window too big, subitem board id | Check the argument; use a smaller `limit` |
| `ColumnValueException` | Wrong value format, or a column that can't be written | Query `columns { id type }`; use the format table |
| `CorrectedValueException` | Simple string sent to a column that needs JSON | Use the column's JSON format |
| `InvalidColumnIdException` | Column title used, or a typo | Use the column **id** |
| `InvalidBoardIdException`, `ResourceNotFoundException` | Wrong id, deleted resource, or no access | Copy the id from the URL again |
| `ItemNameTooLongException` | Name over 255 characters | Shorten it |
| `ItemsLimitationException` | Board has 10,000 items | Archive or delete items, or use another board |
| `DeleteLastGroupException` | Deleting the board's last group | Keep at least one group |
| `UserUnauthorizedException` (403) | User can't do this on this board | Check the user's access to the board |
| `missingRequiredPermissions` | The app's scopes don't allow it | Ask the learner to check the app's permission scopes |
| 423 `Resource is currently locked` | Another process is writing to the board | Wait and retry; send writes one at a time |
| `COMPLEXITY_BUDGET_EXHAUSTED`, `REQUEST_MAX_COMPLEXITY_EXCEEDED` | Too much complexity per minute, or one query over 5M | See [complexity-and-limits.md](complexity-and-limits.md) |
| `Rate Limit Exceeded`, `maxConcurrencyExceeded` | Too many calls per minute, or too many at once | Queue calls; wait `retry_in_seconds` |
| `Graphql validation errors` (SeamlessApiClient) | Any GraphQL error | Read `err.response.errors` |
| `Request timed out` (SeamlessApiClient) | Not inside monday's iframe, or a slow call | Open the app inside monday; retry once |
