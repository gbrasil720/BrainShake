import type { Point } from '@/features/board/types'
import { distance } from './geometry'

// Convex hull (Andrew's monotone chain), counter-clockwise in screen coordinates,
// without repeating the first point.
export function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  if (sorted.length < 3) return sorted
  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const half = (list: Point[]) => {
    const chain: Point[] = []
    for (const point of list) {
      while (
        chain.length >= 2 &&
        cross(chain[chain.length - 2], chain[chain.length - 1], point) <= 0
      )
        chain.pop()
      chain.push(point)
    }
    chain.pop()
    return chain
  }
  return [...half(sorted), ...half([...sorted].reverse())]
}

// Area of a simple polygon (shoelace), always positive.
export function polygonArea(polygon: Point[]) {
  let sum = 0
  for (let index = 0; index < polygon.length; index++) {
    const a = polygon[index]
    const b = polygon[(index + 1) % polygon.length]
    sum += a.x * b.y - b.x * a.y
  }
  return Math.abs(sum) / 2
}

export function polygonPerimeter(polygon: Point[]) {
  let sum = 0
  for (let index = 0; index < polygon.length; index++)
    sum += distance(polygon[index], polygon[(index + 1) % polygon.length])
  return sum
}

export type OrientedBox = { center: Point; width: number; height: number; angle: number }

// Smallest rectangle around a convex polygon. One of its sides always lies along
// a hull edge, so trying every edge direction is enough.
export function minAreaRect(hull: Point[]): OrientedBox {
  let best: OrientedBox & { area: number } = {
    center: hull[0],
    width: 0,
    height: 0,
    angle: 0,
    area: Infinity
  }
  for (let index = 0; index < hull.length; index++) {
    const a = hull[index]
    const b = hull[(index + 1) % hull.length]
    const angle = Math.atan2(b.y - a.y, b.x - a.x)
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    let minU = Infinity
    let maxU = -Infinity
    let minV = Infinity
    let maxV = -Infinity
    for (const point of hull) {
      const u = point.x * cos + point.y * sin
      const v = -point.x * sin + point.y * cos
      minU = Math.min(minU, u)
      maxU = Math.max(maxU, u)
      minV = Math.min(minV, v)
      maxV = Math.max(maxV, v)
    }
    const area = (maxU - minU) * (maxV - minV)
    if (area < best.area) {
      const u = (minU + maxU) / 2
      const v = (minV + maxV) / 2
      best = {
        center: { x: u * cos - v * sin, y: u * sin + v * cos },
        width: maxU - minU,
        height: maxV - minV,
        angle,
        area
      }
    }
  }
  const { center, width, height, angle } = best
  return { center, width, height, angle }
}

// Hull vertices thinned to at most `limit`, keeping them spread around the hull,
// so the largest-inscribed searches below stay cheap.
function thin(hull: Point[], limit: number) {
  if (hull.length <= limit) return hull
  return Array.from(
    { length: limit },
    (_, index) => hull[Math.floor((index * hull.length) / limit)]
  )
}

// Largest triangle with its corners on the hull.
export function largestTriangle(hull: Point[]): Point[] {
  const points = thin(hull, 40)
  let best: Point[] = points.slice(0, 3)
  let bestArea = -1
  for (let a = 0; a < points.length; a++)
    for (let b = a + 1; b < points.length; b++)
      for (let c = b + 1; c < points.length; c++) {
        const area = polygonArea([points[a], points[b], points[c]])
        if (area > bestArea) {
          bestArea = area
          best = [points[a], points[b], points[c]]
        }
      }
  return best
}

// Largest quadrilateral with its corners on the hull, in hull order.
export function largestQuadrilateral(hull: Point[]): Point[] {
  const points = thin(hull, 28)
  let best: Point[] = points.slice(0, 4)
  let bestArea = -1
  for (let a = 0; a < points.length; a++)
    for (let b = a + 1; b < points.length; b++)
      for (let c = b + 1; c < points.length; c++)
        for (let d = c + 1; d < points.length; d++) {
          const area = polygonArea([points[a], points[b], points[c], points[d]])
          if (area > bestArea) {
            bestArea = area
            best = [points[a], points[b], points[c], points[d]]
          }
        }
  return best
}

// Centroid and principal axes of a polygon's area. For an ellipse, the axes are
// its own and `radii` are its semi-axes.
export function areaMoments(polygon: Point[]) {
  let area = 0
  let cx = 0
  let cy = 0
  for (let index = 0; index < polygon.length; index++) {
    const a = polygon[index]
    const b = polygon[(index + 1) % polygon.length]
    const cross = a.x * b.y - b.x * a.y
    area += cross
    cx += (a.x + b.x) * cross
    cy += (a.y + b.y) * cross
  }
  area /= 2
  const center = { x: cx / (6 * area), y: cy / (6 * area) }
  let xx = 0
  let yy = 0
  let xy = 0
  for (let index = 0; index < polygon.length; index++) {
    const a = { x: polygon[index].x - center.x, y: polygon[index].y - center.y }
    const next = polygon[(index + 1) % polygon.length]
    const b = { x: next.x - center.x, y: next.y - center.y }
    const cross = a.x * b.y - b.x * a.y
    xx += (a.y * a.y + a.y * b.y + b.y * b.y) * cross
    yy += (a.x * a.x + a.x * b.x + b.x * b.x) * cross
    xy += (a.x * b.y + 2 * a.x * a.y + 2 * b.x * b.y + b.x * a.y) * cross
  }
  // Second moments about the centroid (Ixx = ∫y², Iyy = ∫x², Ixy = ∫xy).
  const ixx = xx / 12
  const iyy = yy / 12
  const ixy = xy / 24
  const angle = 0.5 * Math.atan2(-2 * ixy, ixx - iyy) + Math.PI / 2
  const spread = Math.sqrt(((ixx - iyy) / 2) ** 2 + ixy ** 2)
  const major = (ixx + iyy) / 2 + spread
  const minor = (ixx + iyy) / 2 - spread
  const size = Math.abs(area)
  // For an ellipse with semi-axes a, b: ∫ along the major axis² = π a³ b / 4.
  return {
    center,
    angle,
    radii: { major: 2 * Math.sqrt(major / size), minor: 2 * Math.sqrt(Math.max(0, minor) / size) }
  }
}
