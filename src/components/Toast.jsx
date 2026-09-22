import { Check } from 'lucide-react'

export function Toast({ message }) {
  return (
    <div className="toast">
      <Check size={14} /> {message}
    </div>
  )
}
