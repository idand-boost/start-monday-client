# sessionToken: proving who the user is to a backend

Source: `https://developer.monday.com/apps/docs/mondayget.md`. Use this once the app has its own server. A client-only app doesn't need it.

## What it is

`monday.get('sessionToken')` returns a JWT that monday signs with the app's **client secret**. monday creates a new one every time the app loads. Decoded, it has an expiry (`exp`) and a `dat` object with `account_id` and `user_id`.

The point: a backend can't trust an account or user id sent by the browser, because anyone can change it. It can trust a token only monday could sign.

## Flow

1. The client gets the token and sends it with every request to your backend, in the `Authorization` header.
2. The backend verifies it with the client secret, and rejects the request if verification fails or the token expired.
3. The backend uses `dat.account_id` and `dat.user_id` from the **verified** token, never ids from the request body.

```ts
// client
const { data: token } = await monday.get('sessionToken')
await fetch('/api/scores', { method: 'POST', headers: { Authorization: token }, body: JSON.stringify({ score }) })
```

```ts
// server (Node)
import jwt from 'jsonwebtoken'

const { dat } = jwt.verify(req.headers.authorization, process.env.MONDAY_CLIENT_SECRET)
```

## Rules

- The client secret lives only on the server, in its environment variables. Never in the client, never with a `VITE_` prefix, never logged.
- Get a fresh token before each request (or when it's close to `exp`) instead of keeping one for the whole session.
- This token proves identity. It is not an API token: it doesn't call the monday API by itself.
- In a plain browser tab there is no real token. The mock returns an obviously fake string, and the backend must reject it outside local development.
