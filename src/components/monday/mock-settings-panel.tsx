import { useQueryClient } from '@tanstack/react-query'
import { FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getMockSettings, setMockSettings, type MockSettings } from '@/lib/monday/mock-settings'
import { MONDAY_QUERY_KEY } from '@/lib/monday/query-keys'

const OPTIONS = {
  view: [
    ['board_view', 'Board view'],
    ['item_view', 'Item view'],
    ['none', 'Not in a view'],
  ],
  role: [
    ['member', 'Member'],
    ['guest', 'Guest'],
    ['view_only', 'View-only'],
  ],
  theme: [
    ['light', 'Light'],
    ['dark', 'Dark'],
    ['black', 'Black'],
  ],
} as const satisfies Record<keyof MockSettings, readonly (readonly [string, string])[]>

/**
 * Dev only, in a plain browser tab: choose what the SDK mock pretends. Inside monday, monday decides.
 * Every change is a new "world", so everything read from monday is fetched again.
 */
export function MockSettingsPanel() {
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState(getMockSettings)

  function change<K extends keyof MockSettings>(key: K, value: MockSettings[K]) {
    queryClient.removeQueries({ queryKey: MONDAY_QUERY_KEY }) // The router reloads and fetches again.
    setSettings(setMockSettings({ [key]: value }))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed px-2 py-1">
      <span
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
        title="The SDK is mocked: you are not inside monday"
      >
        <FlaskConical className="size-3.5" /> Mock
      </span>
      {(Object.keys(OPTIONS) as (keyof MockSettings)[]).map((key) => (
        <Select
          key={key}
          value={settings[key]}
          onValueChange={(value) => change(key, value as MockSettings[typeof key])}
        >
          <SelectTrigger size="sm" aria-label={`Mock ${key}`} className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS[key].map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}
