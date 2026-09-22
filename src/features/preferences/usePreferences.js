import { useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '@/features/board/lib/storage.js'

export function usePreferences() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, 'light')
  const [accent, setAccent] = useLocalStorage(STORAGE_KEYS.accent, '#d86e50')
  const [dockPosition, setDockPosition] = useLocalStorage(STORAGE_KEYS.dock, 'bottom')
  const [grid, setGrid] = useState(true)
  return { theme, setTheme, accent, setAccent, dockPosition, setDockPosition, grid, setGrid }
}
