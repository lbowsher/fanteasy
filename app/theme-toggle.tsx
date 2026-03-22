'use client'

import { useEffect, useState, useRef } from 'react'
import { Moon, Sun, Stars, TreePine, Flame, Sunset, Snowflake } from 'lucide-react'

const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon, description: 'Default dark' },
  { id: 'light', label: 'Light', icon: Sun, description: 'Clean light' },
  { id: 'midnight', label: 'Midnight', icon: Stars, description: 'Deep navy' },
  { id: 'forest', label: 'Forest', icon: TreePine, description: 'Rich greens' },
  { id: 'crimson', label: 'Crimson', icon: Flame, description: 'Bold reds' },
  { id: 'sunset', label: 'Sunset', icon: Sunset, description: 'Warm amber' },
  { id: 'arctic', label: 'Arctic', icon: Snowflake, description: 'Icy blues' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

function applyTheme(themeId: ThemeId) {
  if (themeId === 'dark') {
    // Dark is the :root default — remove attribute to use it
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.dataset.theme = themeId
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeId>('dark')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeId | null
    if (saved && THEMES.some(t => t.id === saved)) {
      setTheme(saved)
      applyTheme(saved)
    } else {
      const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches
      const initial = systemLight ? 'light' : 'dark'
      setTheme(initial)
      applyTheme(initial)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectTheme = (id: ThemeId) => {
    setTheme(id)
    localStorage.setItem('theme', id)
    applyTheme(id)
    setOpen(false)
  }

  const current = THEMES.find(t => t.id === theme)!

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-card transition-colors"
        aria-label="Change theme"
        aria-expanded={open}
      >
        <current.icon size={14} />
        <span>{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-md border border-border bg-popover text-popover-foreground shadow-md z-50 py-1 animate-fadeIn">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => selectTheme(t.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-muted ${
                theme === t.id ? 'bg-muted font-medium' : ''
              }`}
            >
              <span className="w-5 flex items-center justify-center"><t.icon size={14} /></span>
              <div className="text-left">
                <div>{t.label}</div>
                <div className="text-muted-foreground text-[10px]">{t.description}</div>
              </div>
              {theme === t.id && (
                <span className="ml-auto text-primary">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
