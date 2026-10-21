import { RouterProvider } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useMondayContext } from '@/lib/monday/context'
import { AppProvider } from './provider'
import { router } from './router'

export function App() {
  return (
    <AppProvider>
      <MondayRouter />
    </AppProvider>
  )
}

/** Hands monday's context to the router, and reloads the routes when it changes (new board, new item...). */
function MondayRouter() {
  const monday = useMondayContext()
  const loadedWith = useRef(monday)

  useEffect(() => {
    // The first context is already loaded: only a change needs a reload.
    if (loadedWith.current === monday) return
    loadedWith.current = monday
    void router.invalidate()
  }, [monday])

  return <RouterProvider router={router} context={{ monday }} />
}
