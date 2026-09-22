import { Shapes } from 'lucide-react'

export function BoardTitle({ name, onRename }) {
  return (
    <div className="board-title">
      <Shapes size={15} />
      <input
        aria-label="Board name"
        value={name}
        onChange={(event) => onRename(event.target.value)}
      />
    </div>
  )
}
