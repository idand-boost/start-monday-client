import type { Theme } from './types'

// What the SDK mock pretends, in a plain browser tab: which feature the app is in, who the user
// is, and the theme. The dev panel in the header changes them, so you can see every screen
// (the wrong-view tips, the guest block...) without leaving the tab. Kept in localStorage.

export type MockView = 'board_view' | 'item_view' | 'none'
export type MockRole = 'member' | 'guest' | 'view_only'

export interface MockSettings {
  view: MockView
  role: MockRole
  theme: Theme
}

const STORAGE_KEY = 'start-monday-client:mock-settings'
const listeners = new Set<(settings: MockSettings) => void>()

function defaultSettings(): MockSettings {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  return { view: 'board_view', role: 'member', theme: prefersDark ? 'dark' : 'light' }
}

export function getMockSettings(): MockSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<MockSettings>
    return { ...defaultSettings(), ...stored }
  } catch {
    return defaultSettings()
  }
}

export function setMockSettings(change: Partial<MockSettings>): MockSettings {
  const next = { ...getMockSettings(), ...change }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private mode or blocked storage: the change still applies until the page reloads.
  }
  listeners.forEach((listener) => listener(next))
  return next
}

/** Calls back on every change. Returns a function that stops listening. */
export function onMockSettingsChange(listener: (settings: MockSettings) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
