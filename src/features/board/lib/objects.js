import { makeId } from '@/lib/id.js'

export function createObject(type, data, point) {
  return {
    id: makeId(type),
    type,
    x: point.x - 130,
    y: point.y - 90,
    w: type === 'text' ? 280 : 250,
    h: type === 'text' ? 145 : 180,
    color: 'yellow',
    text: '',
    ...data
  }
}

export function finishStroke(stroke) {
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

export function addObjects(board, items) {
  return { ...board, objects: [...board.objects, ...items] }
}

export function patchObject(board, id, patch) {
  return {
    ...board,
    objects: board.objects.map((item) => (item.id === id ? { ...item, ...patch } : item))
  }
}

export function moveObjects(board, origins, dx, dy) {
  return {
    ...board,
    objects: board.objects.map((item) => {
      const origin = origins.find((value) => value.id === item.id)
      return origin ? { ...item, x: origin.x + dx, y: origin.y + dy } : item
    })
  }
}

export function removeObjects(board, ids) {
  return { ...board, objects: board.objects.filter((item) => !ids.includes(item.id)) }
}

export function duplicateObjects(items, offset) {
  return items.map((item) => ({
    ...item,
    id: makeId(item.type),
    x: item.x + offset,
    y: item.y + offset
  }))
}

export function bringToFront(board, ids) {
  return {
    ...board,
    objects: [
      ...board.objects.filter((item) => !ids.includes(item.id)),
      ...board.objects.filter((item) => ids.includes(item.id))
    ]
  }
}
