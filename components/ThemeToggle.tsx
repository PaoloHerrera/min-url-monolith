'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>('dark')

  // Sync React state with the class applied pre-hydration by the inline script.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getInitialTheme())
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    const root = document.documentElement
    root.classList.toggle('light', next === 'light')
    window.localStorage.setItem('theme', next)
  }

  const isLight = theme === 'light'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isLight ? 'Activar modo oscuro' : 'Activar modo claro'}
      aria-pressed={isLight}
      title={isLight ? 'Modo oscuro' : 'Modo claro'}
    >
      <Sun data-icon className="hidden in-[.light]:block" />
      <Moon data-icon className="block in-[.light]:hidden" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
