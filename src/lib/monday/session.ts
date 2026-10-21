import { env } from '@/config/env'
import { monday } from './sdk'
import type { AppContext } from './types'

// What a backend needs from the client (track 3): who is calling, and where the backend lives.
// In local dev the SDK mock supplies VITE_DEV_TOKEN and a localhost hosting URL,
// so this file is identical in dev and production.

/** A short-lived JWT signed with the app's client secret. Send it to your backend, which verifies it. */
export async function getSessionToken(): Promise<string> {
  const token = await monday.get('sessionToken')
  return token.data as string
}

/** The URL of the app's backend on monday code. */
export async function getBackendUrl(): Promise<string> {
  const response = await monday.get('context')
  const hostingUrl = (response.data as AppContext).appVersion?.mondayCodeHostingUrl
  if (hostingUrl) return hostingUrl

  // Inside monday while the feature still points at localhost, there is no monday code URL yet.
  if (import.meta.env.DEV) return env.VITE_DEV_BACKEND_URL
  throw new Error('No mondayCodeHostingUrl in the context: deploy the backend to monday code first (mapps code:push).')
}
