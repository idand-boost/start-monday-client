import {
  Boxes,
  Database,
  KeyRound,
  ListOrdered,
  MessageSquareText,
  Radar,
  Rocket,
  Route,
  ShieldCheck,
  SplitSquareHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Highlight {
  icon: LucideIcon
  title: string
  body: string
  /** Where it lives in this template. */
  files: string[]
}

// What track 2 of the course teaches, and where this template does it.
const HIGHLIGHTS: Highlight[] = [
  {
    icon: SplitSquareHorizontal,
    title: 'Two worlds',
    body: 'Inside monday the app is an iframe with the real SDK. In a plain tab, a mock answers the same calls.',
    files: ['src/lib/monday/environment.ts', 'src/lib/monday/mock-sdk.ts'],
  },
  {
    icon: Radar,
    title: 'Context',
    body: 'monday tells the app where it runs: the board, the item, the theme, the user. It is read once and followed.',
    files: ['src/lib/monday/context.tsx'],
  },
  {
    icon: MessageSquareText,
    title: 'monday.execute',
    body: 'Ask monday to act on its own page: show a notice, open an item card, confirm. Try the Greet button.',
    files: ['src/lib/monday/notify.ts'],
  },
  {
    icon: KeyRound,
    title: 'API without leaking a token',
    body: 'Inside monday, SeamlessApiClient needs no token. In dev, the token stays in the Vite server, never the browser.',
    files: ['src/lib/monday/client.ts', 'vite-plugins/monday-dev-api.ts'],
  },
  {
    icon: ListOrdered,
    title: 'Queue and retries',
    body: 'One call at a time. Rate limits, locked boards and network errors wait and retry, three times at most.',
    files: ['src/lib/monday/queue.ts', 'src/lib/monday/errors.ts'],
  },
  {
    icon: Route,
    title: 'A route per feature',
    body: 'One app, many features: each Developer Center feature points at its own route, like /board and /item.',
    files: ['src/app/routes/'],
  },
  {
    icon: Database,
    title: 'Storage',
    body: 'Key-value storage for the whole account or one view, with versions so nobody overwrites anyone.',
    files: ['src/lib/monday/sdk.ts'],
  },
  {
    icon: ShieldCheck,
    title: 'Members only',
    body: 'Guests and view-only users have no API access, so the app stops them up front with a clear message.',
    files: ['src/features/access/api/check-access.ts'],
  },
  {
    icon: Boxes,
    title: 'Ready for a backend',
    body: 'The session token says who is calling; the context says where your monday code backend lives.',
    files: ['src/lib/monday/session.ts', 'src/lib/api-client.ts'],
  },
  {
    icon: Rocket,
    title: 'Deploy',
    body: 'npm run build, then mapps code:push. Or push to main and let GitHub Actions do it.',
    files: ['.github/workflows/deploy.yml'],
  },
]

export function CourseHighlights() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {HIGHLIGHTS.map(({ icon: Icon, title, body, files }, index) => (
        <li key={title} className="animate-rise-in" style={{ '--stagger': index } as React.CSSProperties}>
          <Card className="h-full gap-3 py-5 transition-colors hover:border-primary/40">
            <CardHeader className="px-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="grid size-7 place-items-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
                <h3>{title}</h3>
              </CardTitle>
              <CardDescription className="leading-relaxed">{body}</CardDescription>
              <p className="flex flex-wrap gap-1.5 pt-1">
                {files.map((file) => (
                  <code
                    key={file}
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {file}
                  </code>
                ))}
              </p>
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  )
}
