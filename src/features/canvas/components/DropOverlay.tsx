import { Upload } from 'lucide-react'

export function DropOverlay() {
  return (
    <div className="drop-overlay">
      <Upload size={20} /> Drop to add to the board
    </div>
  )
}
