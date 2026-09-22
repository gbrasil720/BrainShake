import { useEffect, useState } from 'react'

const TOAST_DURATION = 2400

export function useToast() {
  const [toast, setToast] = useState('')
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast])
  return [toast, setToast]
}
