'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // On mount, read the theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    setTheme(savedTheme || systemTheme)
    
    // Apply the theme immediately
    document.documentElement.dataset.theme = savedTheme || systemTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.dataset.theme = newTheme
  }

  return (
    <button 
      onClick={toggleTheme}
      className="text-xs flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-surface transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <span className="flex items-center gap-1">
          <span className="text-yellow-400">☀️</span> 
          <span>Light</span>
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <span className="text-indigo-400">🌙</span> 
          <span>Dark</span>
        </span>
      )}
    </button>
  )
}