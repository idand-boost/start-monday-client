// The parts of monday's context this app reads. The full list: monday.get('context') in the SDK docs.
// Each feature type gets a different context (monday-sdk lecture):
// - board view: boardId
// - item view: boardId + itemId
// - dashboard widget: boardIds

export type Theme = 'light' | 'dark' | 'black'

export interface AppContext {
  /** Which kind of feature is showing the app: 'board_view', 'item_view', 'dashboard_widget'... */
  instanceType?: string
  boardId?: number | string
  itemId?: number | string
  theme: Theme
  user: { id: number | string; isAdmin?: boolean; isGuest?: boolean; isViewOnly?: boolean }
  account?: { id: number | string }
  /** Set by monday when the app's client-side code is hosted on monday code. */
  appVersion?: { mondayCodeHostingUrl?: string }
}

/** The claims inside the sessionToken (a JWT signed with the app's client secret). */
export interface SessionTokenClaims {
  dat: {
    user_id: number
    account_id: number
    is_admin?: boolean
    is_guest?: boolean
    is_view_only?: boolean
  }
}
