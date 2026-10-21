import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import { getContext, onContextChange } from './sdk'
import type { AppContext } from './types'

// monday's context for the whole app: read once, then kept up to date (theme, board, item...).
// Nothing renders until the first context arrives, so no screen has to handle "no context yet".

const MondayContext = createContext<AppContext | null>(null)

interface MondayProviderProps {
  children: ReactNode
  /** Shown until monday sends the first context. */
  fallback?: ReactNode
}

export function MondayProvider({ children, fallback = null }: MondayProviderProps) {
  const [context, setContext] = useState<AppContext | null>(null)

  useEffect(() => {
    let isActive = true
    void getContext().then((first) => isActive && setContext((current) => current ?? first))
    const stopListening = onContextChange((next) => isActive && setContext(next))
    return () => {
      isActive = false
      stopListening()
    }
  }, [])

  if (!context) return fallback
  return <MondayContext value={context}>{children}</MondayContext>
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useMondayContext(): AppContext {
  const context = use(MondayContext)
  if (!context) throw new Error('useMondayContext must be used inside <MondayProvider>')
  return context
}
