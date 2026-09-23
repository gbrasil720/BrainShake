import { Button } from '@/components/ui/button'
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
        <Button
          variant="ghost"
          className="icon-button"
          style={{ display: 'inline-grid', width: 20, height: 20 }}
          title="New board"
          onClick={onCreate}
        >
          <Plus size={14} />
        </Button>
      </div>
      <div className="board-list">
        {boards.map((item) => (
          <div key={item.id} className={'board-item ' + (item.id === activeId ? 'active' : '')}>
            <Button variant="ghost" className="board-switch" onClick={() => onSwitch(item.id)}>
              {item.name}
            </Button>
            {boards.length > 1 && (
              <Button
                variant="ghost"
                className="board-delete"
                aria-label="Delete board"
                onClick={() => onDelete(item.id)}
              >
                <X size={13} />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
