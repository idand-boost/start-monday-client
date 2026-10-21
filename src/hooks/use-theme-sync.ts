import { useEffect } from 'react'
import type { Theme } from '@/lib/monday/types'

/** Puts monday's theme on <html>: light, dark (.dark) or black (.dark.black). See src/index.css. */
export function useThemeSync(theme: Theme) {
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme !== 'light')
    root.classList.toggle('black', theme === 'black')
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark'
  }, [theme])
}
