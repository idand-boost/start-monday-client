import type { MondayClientSdk, MondayStorageApi } from 'monday-sdk-js'
import { env } from '@/config/env'
import { getMockSettings, onMockSettingsChange, type MockSettings } from './mock-settings'
import type { AppContext, SessionTokenClaims } from './types'

// A stand-in for monday-sdk-js in a plain browser tab (npm run dev), with the same interface.
// Code that uses the SDK (session.ts, notify.ts...) is the same in dev and inside monday.
//
// What can be mocked (monday-sdk lecture):
// - context and sessionToken: made up from the mock settings and .env
// - storage: kept in localStorage, with the same answers and version checks as monday
// What can't: execute() and set() change the monday page around the app. The mock logs them.

const MOCK_USER_ID = 1000
const MOCK_ACCOUNT_ID = 2000

export function buildMockContext(settings: MockSettings): AppContext {
  const view = settings.view === 'none' ? undefined : settings.view
  return {
    instanceType: view,
    boardId: view ? env.VITE_DEV_BOARD_ID : undefined,
    itemId: view === 'item_view' ? env.VITE_DEV_ITEM_ID : undefined,
    theme: settings.theme,
    user: {
      id: MOCK_USER_ID,
      isAdmin: false,
      isGuest: settings.role === 'guest',
      isViewOnly: settings.role === 'view_only',
    },
    account: { id: MOCK_ACCOUNT_ID },
    appVersion: { mondayCodeHostingUrl: env.VITE_DEV_BACKEND_URL },
  }
}

/**
 * VITE_DEV_TOKEN when you set one (a token your local backend accepts). Otherwise an unsigned
 * token with the mock user's role, so the access check behaves as it would inside monday.
 * A backend must never accept it: it has no valid signature.
 */
function mockSessionToken(settings: MockSettings): string {
  if (env.VITE_DEV_TOKEN) return env.VITE_DEV_TOKEN
  const claims: SessionTokenClaims = {
    dat: {
      user_id: MOCK_USER_ID,
      account_id: MOCK_ACCOUNT_ID,
      is_admin: false,
      is_guest: settings.role === 'guest',
      is_view_only: settings.role === 'view_only',
    },
  }
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(claims)}.mock-signature`
}

// Same keys, same answers and same version checks as monday.storage, kept in localStorage.
function localStorageApi(prefix: string): MondayStorageApi {
  const read = (key: string) => {
    try {
      const raw = localStorage.getItem(prefix + key)
      return raw ? (JSON.parse(raw) as { value: string; version: string }) : null
    } catch {
      return null
    }
  }
  return {
    async getItem(key) {
      const stored = read(key)
      return { data: { value: stored?.value ?? null, version: stored?.version ?? null, success: true } }
    },
    async setItem(key, value, options) {
      const current = read(key)?.version ?? null
      if (options?.previous_version !== undefined && options.previous_version !== current) {
        return { data: { success: false, error: `Version mismatch: key ${key} was updated from another context` } }
      }
      const version = crypto.randomUUID().slice(0, 8)
      localStorage.setItem(prefix + key, JSON.stringify({ value, version }))
      return { data: { success: true, version } }
    },
    async deleteItem(key) {
      localStorage.removeItem(prefix + key)
      return { data: { success: true } }
    },
  }
}

export function createMockSdk(): MondayClientSdk {
  const storage = Object.assign(localStorageApi('start-monday-client:mock-storage:'), {
    instance: localStorageApi('start-monday-client:mock-instance-storage:'),
  })

  return {
    async get(type) {
      const settings = getMockSettings()
      if (type === 'context') return { data: buildMockContext(settings) }
      if (type === 'sessionToken') return { data: mockSessionToken(settings) }
      return { data: {} }
    },
    listen(type, callback) {
      if (type !== 'context') return () => {}
      callback({ data: buildMockContext(getMockSettings()) })
      return onMockSettingsChange((settings) => callback({ data: buildMockContext(settings) }))
    },
    async execute(type, params) {
      console.info(`[monday mock] execute("${type}") only works inside monday. It would have run with:`, params)
      return { data: type === 'confirm' ? { confirm: true } : {} }
    },
    async set(type, params) {
      console.info(`[monday mock] set("${type}") only works inside monday. It would have run with:`, params)
      return { data: {} }
    },
    storage,
  }
}
