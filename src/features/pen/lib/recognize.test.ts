import { describe, expect, it } from 'vitest'
import type { Point } from '@/features/board/types'
import { bounds, distance, resample, rotate } from './geometry'
import { recognize } from './recognize'

// Deterministic pseudo-random numbers, so a failing case can be reproduced.
function random(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

type Sketch = {
  seed?: number
  wobble?: number
  tilt?: number
  // Fraction of the path to start at, so the stroke doesn't begin on a corner.
  start?: number
  // Fraction of the path drawn past (positive) or short of (negative) the start.
  overshoot?: number
}

// Traces `outline` like a hand would: uneven sampling, a smooth wobble, a tilt,
// and ends that miss each other.
function sketch(outline: Point[], options: Sketch = {}): Point[] {
  const { seed = 1, wobble = 0.02, tilt = 0, start = 0.3, overshoot = 0.04 } = options
  const next = random(seed)
  const path = resample([...outline, outline[0]], 200).slice(0, -1)
  const count = path.length
  const box = bounds(outline)
  const size = Math.max(box.maxX - box.minX, box.maxY - box.minY)
  const points: Point[] = []
  let dx = 0
  let dy = 0
  const total = Math.round(count * (1 + overshoot))
  for (let step = 0; step < total; step += 1 + Math.floor(next() * 3)) {
    dx = dx * 0.8 + (next() - 0.5) * size * wobble
    dy = dy * 0.8 + (next() - 0.5) * size * wobble
    const point = path[(Math.round(start * count) + step) % count]
    points.push({ x: point.x + dx, y: point.y + dy })
  }
  return rotate(points, tilt, { x: 0, y: 0 })
}

const degrees = (value: number) => (value * Math.PI) / 180

const rectangle = (width: number, height: number) => [
  { x: 0, y: 0 },
  { x: width, y: 0 },
  { x: width, y: height },
  { x: 0, y: height }
]

const ellipse = (rx: number, ry: number) =>
  Array.from({ length: 90 }, (_, index) => ({
    x: rx * Math.cos((index / 90) * 2 * Math.PI),
    y: ry * Math.sin((index / 90) * 2 * Math.PI)
  }))

function corners(points: Point[]) {
  return points.slice(0, -1)
}

function sides(points: Point[]) {
  const vertices = corners(points)
  return vertices.map((point, index) => distance(point, vertices[(index + 1) % vertices.length]))
}

describe('recognize', () => {
  it('ignores taps and tiny strokes', () => {
    expect(recognize([{ x: 0, y: 0 }])).toBeNull()
    expect(recognize(sketch(rectangle(8, 8)))).toBeNull()
  })

  it('leaves freehand scribbles alone', () => {
    const scribble = Array.from({ length: 60 }, (_, index) => ({
      x: index * 5,
      y: Math.sin(index / 3) * 40
    }))
    expect(recognize(scribble)).toBeNull()
  })

  it('leaves shapes it does not idealize alone', () => {
    const polygon = (sides: number, radius: (index: number) => number = () => 100) =>
      Array.from({ length: sides }, (_, index) => {
        const angle = (index / sides) * 2 * Math.PI - Math.PI / 2
        return { x: radius(index) * Math.cos(angle), y: radius(index) * Math.sin(angle) }
      })
    const trapezoid = [
      { x: 60, y: 0 },
      { x: 240, y: 0 },
      { x: 300, y: 150 },
      { x: 0, y: 150 }
    ]
    for (const seed of [1, 2, 3]) {
      expect(recognize(sketch(polygon(5), { seed })), `pentagon ${seed}`).toBeNull()
      const star = polygon(10, (index) => (index % 2 ? 45 : 100))
      expect(recognize(sketch(star, { seed })), `star ${seed}`).toBeNull()
      expect(recognize(sketch(trapezoid, { seed })), `trapezoid ${seed}`).toBeNull()
    }
  })

  describe('lines', () => {
    it('straightens a wobbly stroke and snaps it to horizontal', () => {
      const next = random(3)
      const stroke = Array.from({ length: 40 }, (_, index) => ({
        x: index * 5,
        y: index * 0.3 + (next() - 0.5) * 3
      }))
      const result = recognize(stroke)
      expect(result?.kind).toBe('line')
      expect(result?.points).toHaveLength(2)
      expect(result!.points[1].y).toBeCloseTo(result!.points[0].y)
    })

    it('snaps to 45 degrees', () => {
      const stroke = Array.from({ length: 30 }, (_, index) => ({ x: index * 5, y: index * 4.3 }))
      const [start, end] = recognize(stroke)!.points
      expect(end.x - start.x).toBeCloseTo(end.y - start.y)
    })

    it('keeps an angle that is far from any snap', () => {
      const stroke = Array.from({ length: 30 }, (_, index) => ({ x: index * 5, y: index * 2 }))
      const [start, end] = recognize(stroke)!.points
      expect((end.y - start.y) / (end.x - start.x)).toBeCloseTo(0.4, 1)
    })
  })

  describe('rectangles', () => {
    it('turns a crooked square into an even, level square', () => {
      for (const seed of [1, 2, 3, 4, 5]) {
        const result = recognize(sketch(rectangle(200, 186), { seed, tilt: degrees(6) }))
        expect(result?.kind, `seed ${seed}`).toBe('square')
        const [a, b] = corners(result!.points)
        expect(a.y).toBeCloseTo(b.y)
        const lengths = sides(result!.points)
        for (const length of lengths) expect(length).toBeCloseTo(lengths[0])
      }
    })

    it('keeps a rectangle rectangular', () => {
      const result = recognize(sketch(rectangle(300, 150), { seed: 7 }))
      expect(result?.kind).toBe('rectangle')
      const [top, right] = sides(result!.points)
      expect(top / right).toBeCloseTo(2, 0)
    })

    it('keeps a deliberate tilt', () => {
      const result = recognize(sketch(rectangle(240, 140), { seed: 8, tilt: degrees(25) }))
      expect(result?.kind).toBe('rectangle')
      const [a, b] = corners(result!.points)
      const angle = Math.atan2(b.y - a.y, b.x - a.x)
      expect(Math.abs(Math.abs(angle) % (Math.PI / 2))).toBeGreaterThan(degrees(15))
    })

    it('handles strokes whose ends miss each other', () => {
      for (const [start, overshoot] of [
        [0.3, -0.08], // stops short, leaving the corner undrawn
        [0.1, -0.06], // stops short mid-side
        [0.3, 0.15], // runs well past the start
        [0, 0.05] // starts on a corner
      ])
        expect(
          recognize(sketch(rectangle(200, 200), { seed: 9, start, overshoot }))?.kind,
          `start ${start}, overshoot ${overshoot}`
        ).toBe('square')
    })
  })

  describe('ellipses', () => {
    it('turns a lumpy circle into a round one', () => {
      for (const seed of [1, 2, 3, 4, 5]) {
        const result = recognize(sketch(ellipse(100, 94), { seed }))
        expect(result?.kind, `seed ${seed}`).toBe('circle')
        const box = bounds(result!.points)
        expect(box.maxX - box.minX).toBeCloseTo(box.maxY - box.minY)
      }
    })

    it('keeps an ellipse elongated', () => {
      const result = recognize(sketch(ellipse(150, 70), { seed: 11 }))
      expect(result?.kind).toBe('ellipse')
    })
  })

  describe('triangles', () => {
    it('levels the base and centers the apex', () => {
      const outline = [
        { x: 0, y: 200 },
        { x: 106, y: 0 },
        { x: 200, y: 200 }
      ]
      for (const seed of [1, 2, 3]) {
        const result = recognize(sketch(outline, { seed, tilt: degrees(5) }))
        expect(result?.kind, `seed ${seed}`).toBe('triangle')
        const vertices = corners(result!.points).sort((a, b) => a.y - b.y)
        const [apex, left, right] = vertices
        expect(left.y).toBeCloseTo(right.y)
        expect(apex.x).toBeCloseTo((left.x + right.x) / 2)
      }
    })
  })

  describe('diamonds', () => {
    it('recognizes a rhombus with level diagonals', () => {
      const outline = [
        { x: 100, y: 0 },
        { x: 200, y: 70 },
        { x: 100, y: 140 },
        { x: 0, y: 70 }
      ]
      const result = recognize(sketch(outline, { seed: 4 }))
      expect(result?.kind).toBe('diamond')
      const [top, right, bottom, left] = corners(result!.points)
      expect(top.x).toBeCloseTo(bottom.x)
      expect(left.y).toBeCloseTo(right.y)
    })

    it('reads a square turned 45 degrees as a diamond', () => {
      const result = recognize(sketch(rectangle(150, 150), { seed: 5, tilt: degrees(44) }))
      expect(result?.kind).toBe('diamond')
    })
  })
})
