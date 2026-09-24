import type { Point } from '@/features/board/types'
import {
  bounds,
  centroid,
  distance,
  distanceToSegment,
  pathLength,
  resample,
  rotate
} from './geometry'
import {
  areaMoments,
  convexHull,
  largestQuadrilateral,
  largestTriangle,
  minAreaRect,
  polygonArea,
  polygonPerimeter
} from './hull'

export type ShapeKind =
  'line' | 'arrow' | 'rectangle' | 'square' | 'circle' | 'ellipse' | 'triangle' | 'diamond'

// `points` are the idealized outline in the same coordinates as the input stroke.
// Closed shapes repeat their first point at the end. Arrows are drawn as
// tail, tip, barb, tip, barb, so points[0] and points[1] are where they point from and to.
export type Recognition = { kind: ShapeKind; confidence: number; points: Point[] }

const SAMPLES = 64
// Strokes whose box is smaller than this (in px) are taps or dots, not shapes.
const MIN_SIZE = 16
// End-to-end distance over path length above which an open stroke is a line.
const LINE_STRAIGHTNESS = 0.92
// Same, for an arrow's shaft, which bends a little more where the head starts.
const ARROW_STRAIGHTNESS = 0.9
// Tilts smaller than this snap to horizontal/vertical.
const SNAP_ANGLE = (12 * Math.PI) / 180
// Arrow barbs are drawn this far off the shaft, like connector arrowheads.
const BARB_ANGLE = Math.PI / 6
// Relative difference under which two sides are treated as equal.
const EQUAL_SIDES = 0.12

// Closed strokes are classified by how their convex hull compares with shapes
// inscribed in or wrapped around it (as in the CALI recognizer). These ratios
// don't change when a shape is stretched or turned, and a hull ignores the hooks,
// tails, overlaps and wobble of quick drawing.
// Largest inscribed quadrilateral over hull area: 2/π for any ellipse, 1 for any
// quadrilateral. Rounded strokes stay below this.
const ROUND_BELOW = 0.8
// Largest inscribed triangle over hull area: 1 for a triangle, at most 0.5 for
// quadrilaterals and 0.41 for ellipses.
const TRIANGLE_ABOVE = 0.72
// Hull area over its smallest enclosing rectangle: 1 for rectangles, about 0.75
// for diamonds and trapezoids.
const RECTANGLE_ABOVE = 0.85
// Stroke area over hull area. Stars, hearts and other concave outlines fall below.
const MIN_SOLIDITY = 0.72
// Stroke length over hull perimeter. Loops drawn several times, spirals and
// scribbles go above.
const MAX_WINDING = 1.35
// How far (as a share of the size) the outline may dip in from its hull. Deeper
// dents make a heart, a moon or a bean, not a hand-drawn ellipse.
const MAX_DENT = 0.14

// Stricter options for snapping strokes nobody asked to snap (auto-correct), so
// handwriting (an "o", an "l") and loose doodles stay as drawn.
export const UNATTENDED = { minSize: 40, minConfidence: 0.1 }

// `minSize` and `minConfidence` let callers be stricter than the defaults, e.g.
// when snapping strokes nobody asked to snap.
export function recognize(
  stroke: Point[],
  { minSize = MIN_SIZE, minConfidence = 0 }: { minSize?: number; minConfidence?: number } = {}
): Recognition | null {
  if (stroke.length < 3) return null
  const box = bounds(stroke)
  const diagonal = Math.hypot(box.maxX - box.minX, box.maxY - box.minY)
  if (diagonal < minSize) return null
  const points = resample(stroke, SAMPLES)
  // Arrows first: a long barb can reach back close enough to the shaft to look
  // like a closed stroke, and no closed shape has a straight shaft with a short head.
  const result =
    fitArrow(points) ?? (closesOnItself(points, diagonal) ? fitClosed(points) : fitLine(points))
  return result && result.confidence >= minConfidence ? result : null
}

// Whether the stroke comes back to where it started: some point near its end
// passes close to some point near its start. Unlike comparing just the two ends,
// this also holds when the end overshoots the start or curls in past it. A gap of
// up to 15% of the stroke still counts; a "C" leaves about 30% open.
function closesOnItself(points: Point[], diagonal: number) {
  const reach = Math.floor(points.length / 4)
  const head = points.slice(0, reach)
  const tail = points.slice(-reach)
  const gap = Math.max(diagonal * 0.2, pathLength(points) * 0.15)
  return head.some((a) => tail.some((b) => distance(a, b) < gap))
}

function fitLine(points: Point[]): Recognition | null {
  const straightness = distance(points[0], points[points.length - 1]) / pathLength(points)
  if (straightness < LINE_STRAIGHTNESS) return null
  return {
    kind: 'line',
    confidence: (straightness - LINE_STRAIGHTNESS) / (1 - LINE_STRAIGHTNESS),
    points: snapLine(points[0], points[points.length - 1])
  }
}

function fitClosed(points: Point[]): Recognition | null {
  const hull = convexHull(points)
  const area = polygonArea(hull)
  const box = minAreaRect(hull)
  // A line drawn there and back has no inside to classify.
  if (!area || Math.min(box.width, box.height) < Math.max(box.width, box.height) * 0.1) return null
  if (polygonArea(points) / area < MIN_SOLIDITY) return null
  if (pathLength(points) / polygonPerimeter(hull) > MAX_WINDING) return null
  if (dented(points, hull, Math.sqrt(area))) return null

  const triangle = largestTriangle(hull)
  const quadrilateral = largestQuadrilateral(hull)
  const triangleShare = polygonArea(triangle) / area
  const quadrilateralShare = polygonArea(quadrilateral) / area
  const fill = area / (box.width * box.height)
  const margin = (value: number, from: number, span: number) =>
    Math.max(0, Math.min(1, (value - from) / span))

  if (triangleShare >= TRIANGLE_ABOVE)
    return { ...fitTriangle(triangle), confidence: margin(triangleShare, TRIANGLE_ABOVE, 0.2) }
  if (quadrilateralShare < ROUND_BELOW)
    return { ...fitRound(hull), confidence: margin(ROUND_BELOW - quadrilateralShare, 0, 0.12) }
  // A diamond: its diagonals run close to horizontal and vertical. (A rectangle's
  // diagonals mirror each other instead, and a wide one has both nearly level.)
  const [across, down] = [
    [quadrilateral[0], quadrilateral[2]],
    [quadrilateral[1], quadrilateral[3]]
  ]
    .map(([a, b]) => Math.atan2(b.y - a.y, b.x - a.x))
    .map((angle) => Math.abs(Math.sin(angle)))
    .sort((a, b) => a - b)
  if (across < Math.sin(SNAP_ANGLE * 1.5) && down > Math.cos(SNAP_ANGLE * 1.5))
    return { ...diamond(quadrilateral), confidence: margin(quadrilateralShare, ROUND_BELOW, 0.12) }
  if (fill >= RECTANGLE_ABOVE)
    return { ...fitRectangle(box, fill), confidence: margin(fill, RECTANGLE_ABOVE, 0.1) }
  return null
}

// Whether the outline dips deep into its hull somewhere, which only concave
// shapes do. Hooks and tails at the ends of a quick stroke often reach inside, so
// the first and last quarter are left out, unless both ends meet deep inside,
// like at the top of a heart drawn from its notch.
function dented(points: Point[], hull: Point[], size: number) {
  const depth = (point: Point) =>
    Math.min(
      ...hull.map((corner, index) =>
        distanceToSegment(point, corner, hull[(index + 1) % hull.length])
      )
    )
  const limit = size * MAX_DENT
  const end = Math.floor(points.length * 0.25)
  if (points.slice(end, -end).some((point) => depth(point) > limit)) return true
  return depth(points[0]) > limit && depth(points[points.length - 1]) > limit
}

// Circle or ellipse with the same center, axes and spread as the hull.
function fitRound(hull: Point[]): Recognition {
  const { center, angle, radii } = areaMoments(hull)
  const round = radii.minor / radii.major > 1 - EQUAL_SIDES
  const rx = round ? Math.sqrt(radii.major * radii.minor) : radii.major
  const ry = round ? rx : radii.minor
  const tilt = foldTilt(angle)
  const outline = Array.from({ length: SAMPLES + 1 }, (_, index) => {
    const t = (index / SAMPLES) * 2 * Math.PI
    return { x: center.x + rx * Math.cos(t), y: center.y + ry * Math.sin(t) }
  })
  return {
    kind: round ? 'circle' : 'ellipse',
    confidence: 0,
    points: rotate(outline, Math.abs(tilt) < SNAP_ANGLE ? angle - tilt : angle, center)
  }
}

// The smallest rectangle around the stroke, pulled in to the stroke's own area so
// overshooting corners don't make it bigger than drawn.
function fitRectangle(box: ReturnType<typeof minAreaRect>, fill: number): Recognition {
  const { center, angle } = box
  let width = box.width * Math.sqrt(fill)
  let height = box.height * Math.sqrt(fill)
  const square = Math.abs(width - height) / Math.max(width, height) < EQUAL_SIDES
  if (square) width = height = (width + height) / 2
  const tilt = foldTilt(angle)
  const corners = rotate(
    [
      { x: center.x - width / 2, y: center.y - height / 2 },
      { x: center.x + width / 2, y: center.y - height / 2 },
      { x: center.x + width / 2, y: center.y + height / 2 },
      { x: center.x - width / 2, y: center.y + height / 2 }
    ],
    angle,
    center
  )
  // A square turned about 45° reads as a diamond.
  if (square && Math.abs(Math.abs(tilt) - Math.PI / 4) < SNAP_ANGLE) return diamond(corners)
  return {
    kind: square ? 'square' : 'rectangle',
    confidence: 0,
    points: closePath(Math.abs(tilt) < SNAP_ANGLE ? rotate(corners, -tilt, center) : corners)
  }
}

// Straight line between the ends, turned to the nearest 45° when it is close.
function snapLine(start: Point, end: Point): Point[] {
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const step = Math.PI / 4
  const snapped = Math.round(angle / step) * step
  if (Math.abs(angle - snapped) > SNAP_ANGLE) return [start, end]
  const length = distance(start, end)
  return [
    start,
    { x: start.x + length * Math.cos(snapped), y: start.y + length * Math.sin(snapped) }
  ]
}

// A straight shaft whose far end turns back into one or two short barbs.
function fitArrow(points: Point[]): Recognition | null {
  const tail = points[0]
  // A V head comes back to the tip before its second barb, so the tip is the
  // first point where the stroke, nearly as far out as it ever gets, turns back.
  const reaches = points.map((point) => distance(point, tail))
  const reach = Math.max(...reaches)
  const tipIndex = reaches.findIndex(
    (value, index) => value >= reach * 0.9 && value >= (reaches[index + 1] ?? -Infinity)
  )
  // The head needs a few samples after the tip; otherwise this is just a line.
  if (tipIndex > points.length - 4) return null
  const tip = points[tipIndex]
  const length = distance(tail, tip)
  const straightness = length / pathLength(points.slice(0, tipIndex + 1))
  const head = points.slice(tipIndex + 1)
  const headLength = pathLength([tip, ...head])
  if (straightness < ARROW_STRAIGHTNESS || headLength > length * 1.6) return null

  // Farthest point of the head on each side of the shaft.
  const back = { x: (tail.x - tip.x) / length, y: (tail.y - tip.y) / length }
  const barbs: Record<'left' | 'right', { length: number; angle: number } | null> = {
    left: null,
    right: null
  }
  for (const point of head) {
    const dx = point.x - tip.x
    const dy = point.y - tip.y
    const offset = Math.hypot(dx, dy)
    if (offset > length * 0.6) return null
    if (!offset) continue
    const side = back.x * dy - back.y * dx > 0 ? 'left' : 'right'
    const angle = Math.acos(Math.max(-1, Math.min(1, (back.x * dx + back.y * dy) / offset)))
    if (!barbs[side] || offset > barbs[side].length) barbs[side] = { length: offset, angle }
  }
  const found = [barbs.left, barbs.right].filter(
    (barb): barb is { length: number; angle: number } =>
      barb !== null &&
      barb.length > length * 0.08 &&
      barb.angle > degrees(10) &&
      barb.angle < degrees(80)
  )
  if (!found.length) return null

  const [start, end] = snapLine(tail, tip)
  const barbLength = Math.min(
    length * 0.4,
    Math.max(length * 0.1, found.reduce((sum, barb) => sum + barb.length, 0) / found.length)
  )
  const direction = Math.atan2(start.y - end.y, start.x - end.x)
  const barb = (angle: number) => ({
    x: end.x + barbLength * Math.cos(direction + angle),
    y: end.y + barbLength * Math.sin(direction + angle)
  })
  return {
    kind: 'arrow',
    confidence: (straightness - ARROW_STRAIGHTNESS) / (1 - ARROW_STRAIGHTNESS),
    points: [start, end, barb(BARB_ANGLE), end, barb(-BARB_ANGLE)]
  }
}

function degrees(value: number) {
  return (value * Math.PI) / 180
}

// Angle folded into (-45°, 45°]: how far a direction is from the nearest axis.
function foldTilt(angle: number) {
  const quarter = Math.PI / 2
  const tilt = angle - Math.round(angle / quarter) * quarter
  return tilt <= -Math.PI / 4 ? tilt + quarter : tilt
}

function fitTriangle(corners: Point[]): Recognition {
  const center = centroid(corners)
  // Work in the frame where the side closest to an axis is level.
  const tilts = corners.map((corner, index) => {
    const next = corners[(index + 1) % 3]
    return foldTilt(Math.atan2(next.y - corner.y, next.x - corner.x))
  })
  const base = tilts.reduce(
    (best, value, index) => (Math.abs(value) < Math.abs(tilts[best]) ? index : best),
    0
  )
  const vertices = rotate(corners, -tilts[base], center)
  const a = vertices[base]
  const b = vertices[(base + 1) % 3]
  const apex = vertices[(base + 2) % 3]
  const axis = Math.abs(a.x - b.x) > Math.abs(a.y - b.y) ? 'x' : 'y'
  const across = axis === 'x' ? 'y' : 'x'
  a[across] = b[across] = (a[across] + b[across]) / 2
  // Center the apex over the base (isosceles) when it is almost centered.
  const middle = (a[axis] + b[axis]) / 2
  if (Math.abs(apex[axis] - middle) < Math.abs(a[axis] - b[axis]) * EQUAL_SIDES) apex[axis] = middle
  // Keep the drawn tilt unless it was close enough to level to snap.
  const tilt = Math.abs(tilts[base]) < SNAP_ANGLE ? 0 : tilts[base]
  return { kind: 'triangle', confidence: 0, points: closePath(rotate(vertices, tilt, center)) }
}

function diamond(corners: Point[]): Recognition {
  const box = bounds(corners)
  const middle = { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 }
  return {
    kind: 'diamond',
    confidence: 0,
    points: closePath([
      { x: middle.x, y: box.minY },
      { x: box.maxX, y: middle.y },
      { x: middle.x, y: box.maxY },
      { x: box.minX, y: middle.y }
    ])
  }
}

function closePath(points: Point[]) {
  return [...points, { ...points[0] }]
}
