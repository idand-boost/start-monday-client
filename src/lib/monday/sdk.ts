import mondaySdk, { type MondayClientSdk } from 'monday-sdk-js'
import { isInsideMonday } from './environment'
import { createMockSdk } from './mock-sdk'
import type { AppContext } from './types'

// The one place the app talks to the monday page around it (monday-sdk-js).
// The rest of the app calls `monday` or the small functions below, never mondaySdk() directly.
//
// Inside monday, `monday` is the real SDK. In a plain browser tab during `npm run dev` it is the
// mock (mock-sdk.ts), which answers the same calls. The mock is never part of a production build.

export const monday: MondayClientSdk = isInsideMonday || !import.meta.env.DEV ? mondaySdk() : createMockSdk()

export { isInsideMonday }

export async function getContext(): Promise<AppContext> {
  const response = await monday.get('context')
  return response.data as AppContext
}

/** Calls back on every context change (theme, board, item...). Returns a function that stops listening. */
export function onContextChange(callback: (context: AppContext) => void): () => void {
  return monday.listen('context', (response) => callback(response.data as AppContext))
}

// Storage (monday-sdk lecture). Values are strings, up to 6 MB per key. Every read and write
// returns a version: pass the one you read as previous_version, so you never overwrite someone else.
/** Shared by the whole app in the account, on every board. Survives new app versions. */
export const globalStorage = monday.storage
/** Only this one view (this board view, this widget...). */
export const instanceStorage = monday.storage.instance
