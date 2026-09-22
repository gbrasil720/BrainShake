import { Zap } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Zap size={28} />
      </div>
      <h1>A place to think out loud</h1>
      <p>
        Drop files here, create a note, draw, or connect ideas. Your board is saved automatically on
        this device.
      </p>
    </div>
  )
}
