import type { BoardItem, Point } from '@/features/board/types'
import { isCanvasItem } from '@/features/board/types'

// How far outside an object an arrow end may land and still point at it.
const REACH = 12
const OPEN_SHAPES = ['line', 'arrow']

// Objects an arrow drawn from `tail` to `tip` connects, as [from, to], or null
// when either end isn't on an object or both ends are on the same one.
export function arrowLink(objects: BoardItem[], tail: Point, tip: Point): [string, string] | null {
  const from = objectAt(objects, tail)
  const to = objectAt(objects, tip)
  return from && to && from !== to ? [from, to] : null
}

// Topmost object at `point`. Freehand strokes only count once snapped to a closed
// shape; otherwise their loose bounding box would catch arrows meant for others.
function objectAt(objects: BoardItem[], point: Point) {
  for (let index = objects.length - 1; index >= 0; index--) {
    const item = objects[index]
    if (!isCanvasItem(item)) continue
    if (
      item.type === 'stroke' &&
      (!item.recognizedShape || OPEN_SHAPES.includes(item.recognizedShape))
    )
      continue
    if (
      point.x >= item.x - REACH &&
      point.x <= item.x + item.w + REACH &&
      point.y >= item.y - REACH &&
      point.y <= item.y + item.h + REACH
    )
      return item.id
  }
  return null
}
