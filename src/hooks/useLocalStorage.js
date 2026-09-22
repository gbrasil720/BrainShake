import { useEffect, useState } from 'react'

// String value persisted under `key`. Empty or missing values fall back to `fallback`.
export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => localStorage.getItem(key) || fallback)
  useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])
  return [value, setValue]
}
