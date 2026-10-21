import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/board', label: 'Board view' },
  { to: '/item', label: 'Item view' },
] as const

interface AppLayoutProps {
  children: ReactNode
  /** Dev tools for the header, like the mock settings. */
  toolbar?: ReactNode
}

export function AppLayout({ children, toolbar }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-heading text-sm font-semibold">
            <Logo /> start-monday-client
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                )}
                activeProps={{
                  className: 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
          {toolbar && <div className="ml-auto">{toolbar}</div>}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      <circle cx="9" cy="20" r="3.2" fill="#f62b54" />
      <circle cx="16" cy="16" r="3.2" fill="#ffcc00" />
      <circle cx="23" cy="12" r="3.2" fill="#00ca72" />
    </svg>
  )
}
