// Every GraphQL operation the app sends to monday, in one place.
// Look them up in the API playground (monday.com/developers/v2/try-it-yourself) before adding one.
//
// This file is also read by the dev server (vite-plugins/monday-dev-api.ts), so it must stay
// plain TypeScript with no imports.

/** The signed-in user. Needs the me:read scope. Used by the access check and the greeting. */
export const GET_ME = /* GraphQL */ `
  query GetMe {
    me {
      id
      name
      is_guest
      is_view_only
      is_pending
      is_verified
    }
  }
`

/** One board's name. Needs the boards:read scope. */
export const GET_BOARD = /* GraphQL */ `
  query GetBoard($boardId: ID!) {
    boards(ids: [$boardId]) {
      id
      name
    }
  }
`

/** One item's name and its board. Needs the boards:read scope. */
export const GET_ITEM = /* GraphQL */ `
  query GetItem($itemId: ID!) {
    items(ids: [$itemId]) {
      id
      name
      board {
        id
        name
      }
    }
  }
`

// The dev-only endpoint refuses anything not in this list, so even a request that sneaks past
// its other checks cannot do more than this. Add every new operation here.
export const ALLOWED_OPERATIONS: readonly string[] = [GET_ME, GET_BOARD, GET_ITEM]

/** Path of the dev-only endpoint. It only exists in `npm run dev`. */
export const DEV_ENDPOINT = '/__monday'
