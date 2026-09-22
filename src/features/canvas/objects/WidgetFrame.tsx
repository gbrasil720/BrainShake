import type React from 'react'
import type { CanvasItem } from '@/features/board/types'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

// Card with a draggable titlebar and a close button, used by framed object types.
export function WidgetFrame({
  item,
  onDrag,
  onRemove,
  children
}: {
  item: CanvasItem
  onDrag: (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => void
  onRemove: (id: string) => void
  children: ReactNode
}) {
  return (
    <div className="object-card">
      <div className="widget-titlebar" onPointerDown={(event) => onDrag(event, item)}>
        <span>{item.name || item.title || item.type}</span>
        <button
          type="button"
          aria-label="Close widget"
          title="Close widget"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onRemove(item.id)
          }}
        >
          <X size={13} />
        </button>
      </div>
      {children}
    </div>
  )
}
