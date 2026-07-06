import { useEffect, useSyncExternalStore } from 'react'

/* Light is the default; the choice persists in localStorage and the
   `dark` class on <html>. An inline script in __root applies it
   before hydration so there is no flash. */
const KEY = 'lokvera-theme'
type Theme = 'light' | 'dark'

let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* private mode */
  }
  notify()
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.push(cb)
      return () => {
        listeners = listeners.filter((l) => l !== cb)
      }
    },
    readTheme,
    () => 'light' as Theme,
  )

  // sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        document.documentElement.classList.toggle('dark', e.newValue === 'dark')
        notify()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return {
    theme,
    toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  }
}

export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${KEY}')==='dark')document.documentElement.classList.add('dark')}catch(e){}`
