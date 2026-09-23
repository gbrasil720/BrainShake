import type { CanvasItem, Point } from '@/features/board/types'

export function strokePath(points: Point[]) {
  return points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
}

export function StrokeObject({ item }: { item: CanvasItem }) {
  const path = strokePath(item.points || [])
  return (
    <svg className="stroke" viewBox={`0 0 ${item.w} ${item.h}`}>
      <path
        className="stroke-hit-area"
        style={{ strokeWidth: (item.strokeWidth || 4) + 10 }}
        d={path}
      />
      <path
        style={{ stroke: item.strokeColor || undefined, strokeWidth: item.strokeWidth || 4 }}
        d={path}
      />
    </svg>
  )
}
