import { makeId } from '@/lib/id'
import type { Board, BoardItem, BoardPatch, CanvasItem, Point } from '../types'

// `data` must include the size (w/h); see defaultSize in the canvas object registry.
export function createObject(
  type: string,
  data: Partial<CanvasItem> & Pick<CanvasItem, 'w' | 'h'>,
  point: Point
): CanvasItem {
  return {
    id: makeId(type),
    type,
    x: point.x - 130,
    y: point.y - 90,
    color: 'yellow',
    text: '',
    ...data
  }
}

export function finishStroke(stroke: CanvasItem & { points: Point[]; strokeWidth: number }) {
  const padding = (stroke.strokeWidth || 4) / 2
  const bounds = stroke.points.reduce(
    (result, point) => ({
      minX: Math.min(result.minX, point.x),
      minY: Math.min(result.minY, point.y),
      maxX: Math.max(result.maxX, point.x),
      maxY: Math.max(result.maxY, point.y)
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  )
  const minX = bounds.minX - padding
  const minY = bounds.minY - padding
  return {
    ...stroke,
    x: stroke.x + minX,
    y: stroke.y + minY,
    w: Math.max(stroke.strokeWidth || 4, bounds.maxX - minX + padding),
    h: Math.max(stroke.strokeWidth || 4, bounds.maxY - minY + padding),
    points: stroke.points.map((point) => ({ x: point.x - minX, y: point.y - minY }))
  }
}

export type StrokeBounds = { minX: number; minY: number; maxX: number; maxY: number }

export function resizeStroke(
  stroke: Pick<CanvasItem, 'w' | 'h' | 'points'>,
  width: number,
  height: number
) {
  const scaleX = width / stroke.w
  const scaleY = height / stroke.h
  return {
    w: width,
    h: height,
    points: (stroke.points || []).map((point) => ({
      x: point.x * scaleX,
      y: point.y * scaleY
    }))
  }
}

export function getStrokeBounds(stroke: CanvasItem): StrokeBounds | null {
  if (stroke.type !== 'stroke' || !stroke.points?.length) return null
  const padding = (stroke.strokeWidth || 4) / 2
  const points = stroke.points
  const bounds = points.reduce(
    (result, point) => ({
      minX: Math.min(result.minX, point.x),
      minY: Math.min(result.minY, point.y),
      maxX: Math.max(result.maxX, point.x),
      maxY: Math.max(result.maxY, point.y)
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  )
  return {
    minX: stroke.x + bounds.minX - padding,
    minY: stroke.y + bounds.minY - padding,
    maxX: stroke.x + bounds.maxX + padding,
    maxY: stroke.y + bounds.maxY + padding
  }
}

export function getStrokeGroups(strokes: CanvasItem[], gap = 18) {
  const items = strokes.filter((stroke) => stroke.type === 'stroke' && stroke.points?.length)
  const bounds = new Map(items.map((stroke) => [stroke.id, getStrokeBounds(stroke)!]))
  const groups: CanvasItem[][] = []
  const visited = new Set<string>()

  for (const stroke of items) {
    if (visited.has(stroke.id)) continue
    const group: CanvasItem[] = []
    const queue = [stroke]
    visited.add(stroke.id)
    while (queue.length) {
      const current = queue.shift()!
      group.push(current)
      const currentBounds = bounds.get(current.id)!
      for (const candidate of items) {
        if (visited.has(candidate.id)) continue
        const candidateBounds = bounds.get(candidate.id)!
        const separated =
          currentBounds.maxX + gap < candidateBounds.minX ||
          candidateBounds.maxX + gap < currentBounds.minX ||
          currentBounds.maxY + gap < candidateBounds.minY ||
          candidateBounds.maxY + gap < currentBounds.minY
        if (!separated) {
          visited.add(candidate.id)
          queue.push(candidate)
        }
      }
    }
    groups.push(group)
  }
  return groups
}

export function addObjects(board: Board, items: BoardItem[]): Board {
  return { ...board, objects: [...board.objects, ...items] }
}

export function patchObject(board: Board, id: string, patch: BoardPatch): Board {
  return {
    ...board,
    objects: board.objects.map((item) => (item.id === id ? { ...item, ...patch } : item))
  }
}

export function moveObjects(
  board: Board,
  origins: (Point & { id: string })[],
  dx: number,
  dy: number
): Board {
  return {
    ...board,
    objects: board.objects.map((item) => {
      const origin = origins.find((value) => value.id === item.id)
      return origin && 'x' in item ? { ...item, x: origin.x + dx, y: origin.y + dy } : item
    })
  }
}

export function removeObjects(board: Board, ids: string[]): Board {
  return { ...board, objects: board.objects.filter((item) => !ids.includes(item.id)) }
}

export function duplicateObjects(items: BoardItem[], offset: number): BoardItem[] {
  return items.map((item) => ({
    ...item,
    id: makeId(item.type),
    ...('x' in item ? { x: item.x + offset, y: item.y + offset } : {})
  }))
}

export function bringToFront(board: Board, ids: string[]): Board {
  return {
    ...board,
    objects: [
      ...board.objects.filter((item) => !ids.includes(item.id)),
      ...board.objects.filter((item) => ids.includes(item.id))
    ]
  }
}
