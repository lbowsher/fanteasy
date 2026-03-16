'use client'

import { useEffect } from 'react'

const VALID_THEMES = ['dark', 'light', 'midnight', 'forest', 'crimson', 'sunset', 'arctic']

// This component is used to initialize the theme on the client side
// It prevents the flash of incorrect theme
export default function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme && VALID_THEMES.includes(savedTheme)) {
      if (savedTheme === 'dark') {
        // Dark is the :root default — remove attribute
        document.documentElement.removeAttribute('data-theme')
      } else {
        document.documentElement.dataset.theme = savedTheme
      }
    } else {
      // No saved theme — let CSS media query handle system preference
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  return null
}
