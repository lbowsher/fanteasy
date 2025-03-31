'use client'

import { useEffect } from 'react'

// This component is used to initialize the theme on the client side
// It prevents the flash of incorrect theme
export default function ThemeInitializer() {
  useEffect(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      // If saved theme exists, apply it
      document.documentElement.dataset.theme = savedTheme
    } else {
      // Otherwise, let the system preference from CSS media query apply
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])
  
  return null
}