import type { BoardItem, CanvasItem, Point } from '@/features/board/types'
import { isCanvasItem } from '@/features/board/types'
import { bounds, distance, distanceToSegment, isClosed, pathLength, resample } from './geometry'

// A pen stroke that is a command instead of a drawing: scribbling over objects
// erases them, looping around objects selects them.
export type Gesture = { type: 'erase' | 'select'; ids: string[] }

const SAMPLES = 64
// Direction changes a stroke needs before it counts as a scribble.
const SCRIBBLE_TURNS = 4
// Share of a scribble's samples that must land on an object to erase it.
const SCRIBBLE_COVER = 0.25
// How close (in px, beyond half the stroke width) a scribble must pass to a pen stroke.
const STROKE_REACH = 8

// `points` are in board coordinates.
export function recognizeGesture(points: Point[], objects: BoardItem[]): Gesture | null {
  if (points.length < 3) return null
  const items = objects.filter(isCanvasItem).filter((item) => !item.locked)
  const samples = resample(points, SAMPLES)

  if (isScribble(samples)) {
    const ids = items.filter((item) => scribbledOver(item, samples)).map((item) => item.id)
    return ids.length ? { type: 'erase', ids } : null
  }
  if (isClosed(points)) {
    const ids = items.filter((item) => enclosed(item, samples)).map((item) => item.id)
    return ids.length ? { type: 'select', ids } : null
  }
  return null
}

// Back-and-forth strokes: many reversals along one axis, and much longer than
// the area they cover.
function isScribble(samples: Point[]) {
  const box = bounds(samples)
  const diagonal = Math.hypot(box.maxX - box.minX, box.maxY - box.minY)
  if (!diagonal || pathLength(samples) < diagonal * 3) return false
  return Math.max(turns(samples, 'x', diagonal), turns(samples, 'y', diagonal)) >= SCRIBBLE_TURNS
}

// Direction changes along `axis`, ignoring wobble under a fifth of the diagonal.
function turns(samples: Point[], axis: 'x' | 'y', diagonal: number) {
  let count = 0
  let direction = 0
  let anchor = samples[0][axis]
  for (const point of samples) {
    const delta = point[axis] - anchor
    if (Math.abs(delta) < diagonal * 0.2) continue
    const sign = Math.sign(delta)
    if (direction && sign !== direction) count++
    direction = sign
    anchor = point[axis]
  }
  return count
}

function scribbledOver(item: CanvasItem, samples: Point[]) {
  if (item.type === 'stroke' && item.points?.length) {
    // Pen strokes are thin, so test against the line itself, not its box.
    const reach = (item.strokeWidth || 4) / 2 + STROKE_REACH
    const line = item.points.map((point) => ({ x: item.x + point.x, y: item.y + point.y }))
    return samples.some((sample) =>
      line.length === 1
        ? distance(sample, line[0]) <= reach
        : line.some(
            (point, index) =>
              index > 0 && distanceToSegment(sample, line[index - 1], point) <= reach
          )
    )
  }
  const inside = samples.filter(
    (point) =>
      point.x >= item.x &&
      point.x <= item.x + item.w &&
      point.y >= item.y &&
      point.y <= item.y + item.h
  )
  return inside.length >= samples.length * SCRIBBLE_COVER
}

// The whole object lies inside the loop.
function enclosed(item: CanvasItem, loop: Point[]) {
  return [
    { x: item.x, y: item.y },
    { x: item.x + item.w, y: item.y },
    { x: item.x + item.w, y: item.y + item.h },
    { x: item.x, y: item.y + item.h }
  ].every((corner) => insidePolygon(corner, loop))
}

// Ray casting; the polygon is closed implicitly between its last and first points.
function insidePolygon(point: Point, polygon: Point[]) {
  let inside = false
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[index]
    const b = polygon[previous]
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside
  }
  return inside
}
