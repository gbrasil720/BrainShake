import type { Board } from '@/features/board/types'
import { Plus, X } from 'lucide-react'

export function BoardList({
  boards,
  activeId,
  onCreate,
  onSwitch,
  onDelete
}: {
  boards: Board[]
  activeId: string
  onCreate: () => void
  onSwitch: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="sidebar-section">
      <div className="section-label">
        Boards{' '}
        <button
          className="icon-button"
          style={{ display: 'inline-grid', width: 20, height: 20 }}
          title="New board"
          onClick={onCreate}
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="board-list">
        {boards.map((item) => (
          <button
            key={item.id}
            className={'board-item ' + (item.id === activeId ? 'active' : '')}
            onClick={() => onSwitch(item.id)}
          >
            <span>{item.name}</span>
            {boards.length > 1 && (
              <span
                className="board-delete"
                role="button"
                aria-label="Delete board"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(item.id)
                }}
              >
                <X size={13} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
