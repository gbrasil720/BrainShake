import type { BoardItem, CanvasItem } from '@/features/board/types'
import { isCanvasItem, isConnectorItem } from '@/features/board/types'

function center(item: CanvasItem) {
  return { x: item.x + item.w / 2, y: item.y + item.h / 2 }
}

// Straight arrows between the centers of connected objects.
export function ConnectorLayer({ objects }: { objects: BoardItem[] }) {
  const connectors = objects.filter(isConnectorItem)
  return (
    <svg className="canvas-world" style={{ width: 1, height: 1, overflow: 'visible' }}>
      {connectors.map((item) => {
        const from = objects.filter(isCanvasItem).find((object) => object.id === item.from)
        const to = objects.filter(isCanvasItem).find((object) => object.id === item.to)
        if (!from || !to) return null
        const start = center(from)
        const end = center(to)
        return (
          <g className="connector" key={item.id}>
            <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            <polygon
              points={`${end.x},${end.y} ${end.x - 10},${end.y - 4} ${end.x - 7},${end.y + 7}`}
            />
          </g>
        )
      })}
    </svg>
  )
}
