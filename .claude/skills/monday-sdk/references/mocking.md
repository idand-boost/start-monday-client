# Mocking the SDK in a plain browser tab

Outside monday's iframe there is no monday page to answer, and SDK promises may never resolve. Detect where the app runs, and swap in mocks for what can be mocked.

## Contents

- Detect the environment
- What to mock and what not
- Module to adapt
- Using it

## Detect the environment

```ts
export const isInsideMonday = window.self !== window.top
```

An iframe has a parent window, and a plain tab doesn't. Decide once at startup. Don't call `monday.get` just to find out, because it can hang.

## What to mock and what not

| SDK part                       | Mock                                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `get('context')`               | Fixed test values: a test board id from a dev-only setting, a user, a theme                                                            |
| `listen('context')`            | Call the callback once with the mock context, return a no-op unsubscribe                                                               |
| `storage` / `storage.instance` | `localStorage`, with the same return shape (`{ data: { value, version, success } }`) and separate key prefixes for global and instance |
| `get('sessionToken')`          | An obviously fake string. Never accepted by a real backend                                                                             |
| `execute`, `set`               | **Can't be mocked.** Log the call and params, resolve with a harmless value                                                            |

The mock board id is for local development only. It must never decide where the app writes inside monday.

## Module to adapt

Adapt names, types and the dev board id to the project. Keep the rest of the app talking to these functions, never to `mondaySdk()` directly.

```ts
import mondaySdk from 'monday-sdk-js'

const isInsideMonday = window.self !== window.top
const monday = isInsideMonday ? mondaySdk() : null

const MOCK_CONTEXT = {
  boardId: Number(import.meta.env.VITE_DEV_BOARD_ID), // a test board, local development only
  instanceType: 'board_view',
  theme: 'light',
  user: { id: 'mock-user', isAdmin: true, isViewOnly: false },
}

export async function getContext() {
  if (monday) return (await monday.get('context')).data
  return MOCK_CONTEXT
}

export function onContextChange(callback: (context: typeof MOCK_CONTEXT) => void) {
  if (monday) return monday.listen('context', (res) => callback(res.data))
  callback(MOCK_CONTEXT)
  return () => {}
}

function localStore(prefix: string) {
  return {
    async getItem(key: string) {
      const raw = localStorage.getItem(prefix + key)
      const stored = raw ? JSON.parse(raw) : { value: null, version: null }
      return { data: { ...stored, success: true } }
    },
    async setItem(key: string, value: string, options?: { previous_version?: string }) {
      const raw = localStorage.getItem(prefix + key)
      const current = raw ? JSON.parse(raw).version : null
      if (options?.previous_version && current && options.previous_version !== current) {
        return { data: { success: false, error: `Version mismatch: key ${key} was updated from another context` } }
      }
      const version = crypto.randomUUID().slice(0, 5)
      localStorage.setItem(prefix + key, JSON.stringify({ value, version }))
      return { data: { success: true, version } }
    },
    async deleteItem(key: string) {
      localStorage.removeItem(prefix + key)
      return { data: { success: true, value: null } }
    },
  }
}

export const globalStorage = monday ? monday.storage : localStore('mock-global:')
export const instanceStorage = monday ? monday.storage.instance : localStore('mock-instance:')

export async function execute(type: string, params?: Record<string, unknown>) {
  if (monday) return monday.execute(type, params)
  console.info(`[monday mock] execute("${type}") only works inside monday`, params)
  return { data: type === 'confirm' ? { confirm: true } : {} }
}

export async function getSessionToken() {
  if (monday) return (await monday.get('sessionToken')).data
  return 'mock-session-token-not-valid'
}
```

`VITE_DEV_BOARD_ID` is safe to send to the browser because it's an id, not a secret. Add it to `.env` with a test board, and read it only in the mock branch.

## Using it

- Show a small "mock mode" label in the app when `isInsideMonday` is false, so nobody mistakes mock data for real data.
- Each `execute` in mock mode logs to the Console. Tell the learner that opening item cards, notices and settings can only be tested inside monday.
- API queries are not part of this module: the project's API client already has its own dev path.
