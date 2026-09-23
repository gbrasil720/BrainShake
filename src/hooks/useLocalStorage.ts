import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (stored === null) return fallback
    try {
      return JSON.parse(stored) as T
    } catch {
      return stored as T
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue as Dispatch<SetStateAction<T>>] as const
}
