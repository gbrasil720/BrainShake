import type { BoardItem, CanvasItem } from '@/features/board/types'
import { isCanvasItem, isConnectorItem } from '@/features/board/types'

function center(item: CanvasItem) {
  return { x: item.x + item.w / 2, y: item.y + item.h / 2 }
}

function edgePoint(item: CanvasItem, target: CanvasItem) {
  const source = center(item)
  const destination = center(target)
  const dx = destination.x - source.x
  const dy = destination.y - source.y
  if (!dx && !dy) return source
  if (Math.abs(dx) * item.h > Math.abs(dy) * item.w) {
    const x = source.x + (Math.sign(dx) * item.w) / 2
    return { x, y: source.y + (dy / dx) * (x - source.x) }
  }
  const y = source.y + (Math.sign(dy) * item.h) / 2
  return { x: source.x + (dx / dy) * (y - source.y), y }
}

function arrowPoints(start: { x: number; y: number }, end: { x: number; y: number }) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const size = 11
  const spread = Math.PI / 6
  return [
    `${end.x},${end.y}`,
    `${end.x - size * Math.cos(angle - spread)},${end.y - size * Math.sin(angle - spread)}`,
    `${end.x - size * Math.cos(angle + spread)},${end.y - size * Math.sin(angle + spread)}`
  ].join(' ')
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
        const start = edgePoint(from, to)
        const end = edgePoint(to, from)
        return (
          <g className="connector" key={item.id}>
            <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            <polygon points={arrowPoints(start, end)} />
          </g>
        )
      })}
    </svg>
  )
}
