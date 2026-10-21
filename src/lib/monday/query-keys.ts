// Every monday query key starts with this, so one call can refresh everything that came from
// monday (for example when the mock context changes). Features build their own keys on top.
export const MONDAY_QUERY_KEY = ['monday'] as const
