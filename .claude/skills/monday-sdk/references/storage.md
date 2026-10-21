# Storage API

Source: `https://developer.monday.com/apps/docs/mondaystorage.md`.

## Contents

- Instance or global
- Methods and return shapes
- Versions: don't overwrite each other
- Limits
- Pattern: a shared high score
- Pattern: a cache for API results

## Instance or global

|                   | Instance: `monday.storage.instance`                | Global: `monday.storage`                      |
| ----------------- | -------------------------------------------------- | --------------------------------------------- |
| Shared by         | One feature instance (one board view on one board) | The whole app in the account, every board     |
| New major version | Starts empty                                       | Kept                                          |
| Use for           | Per-board state, per-view preferences              | Account-wide data: high scores, shared caches |

Only features that have instances (board views, dashboard widgets) support instance storage. When unsure, ask the learner whether the data should be the same on every board.

## Methods and return shapes

All return promises.

```ts
const res = await monday.storage.getItem('highScore')
// res.data: { value, version, success }

const saved = await monday.storage.setItem('highScore', JSON.stringify(score))
// saved.data: { success, version }

await monday.storage.deleteItem('highScore')
```

Swap `monday.storage` for `monday.storage.instance` to use instance storage. A key that was never set comes back with an empty `value`: treat that as "no data yet", not as an error.

Values are strings. `JSON.stringify` before saving and `JSON.parse` after reading, inside a `try` so one bad value doesn't crash the app.

## Versions: don't overwrite each other

Every `getItem` and `setItem` returns a `version`, which changes whenever the value changes. Pass the last version you read when you save:

```ts
const { value, version } = (await monday.storage.getItem('highScore')).data
const res = await monday.storage.setItem('highScore', JSON.stringify(newScore), { previous_version: version })
if (!res.data.success) {
  // Someone saved in between: read again, decide, try again
}
```

On a mismatch, `success` is `false` and `error` says `Version mismatch: key ... was updated from another context`. Read the new value and decide again (for a high score: is mine still higher?). Retry at most a few times.

The docs' own versioning example leaves out the value argument. Use the `setItem(key, value, options)` signature shown above.

## Limits

- Keys: at most 256 characters.
- Values: at most 6 MB per key.
- No queries over values. Store one object per key, and keep a known key name for each piece of data.

## Pattern: a shared high score

Global storage, one key, versioned save, and save only when the new score is higher than the one just read.

```ts
async function submitScore(score: number) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { value, version } = (await monday.storage.getItem('highScore')).data
    const best = value ? JSON.parse(value).score : 0
    if (score <= best) return { isNewBest: false }
    const res = await monday.storage.setItem('highScore', JSON.stringify({ score }), { previous_version: version })
    if (res.data.success) return { isNewBest: true }
  }
  return { isNewBest: false }
}
```

## Pattern: a cache for API results

When the app runs many queries to work something out (totals across boards, a summary), save the result with a timestamp and reuse it while it's fresh:

```ts
const cached = (await monday.storage.instance.getItem('summary')).data.value
if (cached) {
  const { savedAt, result } = JSON.parse(cached)
  if (Date.now() - savedAt < 10 * 60 * 1000) return result
}
const result = await computeSummary() // the expensive API work
await monday.storage.instance.setItem('summary', JSON.stringify({ savedAt: Date.now(), result }))
return result
```

Decide with the learner how stale is acceptable, and say that a cache can show old data.
