import type { Point } from '@/features/board/types'

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number }

export function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function pathLength(points: Point[]) {
  let length = 0
  for (let index = 1; index < points.length; index++)
    length += distance(points[index - 1], points[index])
  return length
}

export function bounds(points: Point[]): Bounds {
  return points.reduce(
    (result, point) => ({
      minX: Math.min(result.minX, point.x),
      minY: Math.min(result.minY, point.y),
      maxX: Math.max(result.maxX, point.x),
      maxY: Math.max(result.maxY, point.y)
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  )
}

// Mean of the points. Call it on resampled points so slow parts of a stroke
// (many samples close together) don't pull the center toward them.
export function centroid(points: Point[]): Point {
  const sum = points.reduce((result, point) => ({ x: result.x + point.x, y: result.y + point.y }), {
    x: 0,
    y: 0
  })
  return { x: sum.x / points.length, y: sum.y / points.length }
}

// `count` points evenly spaced along the path, so the result no longer depends on
// how fast the pointer moved while drawing.
export function resample(points: Point[], count: number): Point[] {
  if (points.length < 2 || count < 2) return points.slice(0, Math.max(1, count))
  const step = pathLength(points) / (count - 1)
  if (step === 0) return Array.from({ length: count }, () => ({ ...points[0] }))
  const result: Point[] = [{ ...points[0] }]
  let carried = 0
  let previous = points[0]
  for (let index = 1; index < points.length; index++) {
    const current = points[index]
    let segment = distance(previous, current)
    while (carried + segment >= step && result.length < count) {
      const ratio = (step - carried) / segment
      const point = {
        x: previous.x + ratio * (current.x - previous.x),
        y: previous.y + ratio * (current.y - previous.y)
      }
      result.push(point)
      previous = point
      segment = distance(previous, current)
      carried = 0
    }
    carried += segment
    previous = current
  }
  // Floating point can leave the last sample short of the end.
  while (result.length < count) result.push({ ...points[points.length - 1] })
  return result
}

function distanceToSegment(point: Point, start: Point, end: Point) {
  const length = distance(start, end)
  if (length === 0) return distance(point, start)
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) /
        length ** 2
    )
  )
  return distance(point, { x: start.x + t * (end.x - start.x), y: start.y + t * (end.y - start.y) })
}

// Ramer-Douglas-Peucker: drops points closer than `tolerance` to the simplified line.
// The first and last points are always kept.
export function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points.slice()
  const keep = new Array<boolean>(points.length).fill(false)
  keep[0] = keep[points.length - 1] = true
  const stack: [number, number][] = [[0, points.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()!
    let farthest = -1
    let farthestDistance = tolerance
    for (let index = first + 1; index < last; index++) {
      const value = distanceToSegment(points[index], points[first], points[last])
      if (value > farthestDistance) {
        farthest = index
        farthestDistance = value
      }
    }
    if (farthest === -1) continue
    keep[farthest] = true
    stack.push([first, farthest], [farthest, last])
  }
  return points.filter((_, index) => keep[index])
}

// A stroke is closed when its ends meet within `ratio` of its length.
export function isClosed(points: Point[], ratio = 0.2) {
  if (points.length < 3) return false
  const length = pathLength(points)
  return length > 0 && distance(points[0], points[points.length - 1]) <= length * ratio
}

// Interior angle at `vertex`, in degrees: 180 for a straight line, 90 for a right angle.
export function angleAt(previous: Point, vertex: Point, next: Point) {
  const a = Math.atan2(previous.y - vertex.y, previous.x - vertex.x)
  const b = Math.atan2(next.y - vertex.y, next.x - vertex.x)
  const degrees = Math.abs(((a - b) * 180) / Math.PI) % 360
  return degrees > 180 ? 360 - degrees : degrees
}

export function rotate(points: Point[], radians: number, origin: Point): Point[] {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return points.map((point) => {
    const x = point.x - origin.x
    const y = point.y - origin.y
    return { x: origin.x + x * cos - y * sin, y: origin.y + x * sin + y * cos }
  })
}

// Chaikin corner cutting: each pass replaces every segment with points at 1/4 and 3/4.
// Rounds off jitter without moving the stroke's ends.
export function smooth(points: Point[], passes = 2): Point[] {
  let result = points
  for (let pass = 0; pass < passes && result.length > 2; pass++) {
    const next: Point[] = [result[0]]
    for (let index = 0; index < result.length - 1; index++) {
      const a = result[index]
      const b = result[index + 1]
      next.push(
        { x: 0.75 * a.x + 0.25 * b.x, y: 0.75 * a.y + 0.25 * b.y },
        { x: 0.25 * a.x + 0.75 * b.x, y: 0.25 * a.y + 0.75 * b.y }
      )
    }
    next.push(result[result.length - 1])
    result = next
  }
  return result
}
