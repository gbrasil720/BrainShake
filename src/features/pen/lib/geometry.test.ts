import { describe, expect, it } from 'vitest'
import {
  angleAt,
  bounds,
  centroid,
  distance,
  isClosed,
  pathLength,
  resample,
  rotate,
  simplify,
  smooth
} from './geometry'

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
  { x: 0, y: 0 }
]

describe('pathLength', () => {
  it('sums the length of every segment', () => {
    expect(pathLength(square)).toBe(400)
    expect(pathLength([{ x: 3, y: 4 }])).toBe(0)
  })
})

describe('bounds and centroid', () => {
  it('finds the box and center of the points', () => {
    expect(bounds(square)).toEqual({ minX: 0, minY: 0, maxX: 100, maxY: 100 })
    expect(centroid(square.slice(0, 4))).toEqual({ x: 50, y: 50 })
  })
})

describe('resample', () => {
  it('returns evenly spaced points that keep both ends', () => {
    const points = resample(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 90, y: 0 }
      ],
      10
    )
    expect(points).toHaveLength(10)
    expect(points[0]).toEqual({ x: 0, y: 0 })
    expect(points[9].x).toBeCloseTo(90)
    for (let index = 1; index < points.length; index++)
      expect(distance(points[index - 1], points[index])).toBeCloseTo(10)
  })

  it('handles a stroke that never moved', () => {
    expect(
      resample(
        [
          { x: 5, y: 5 },
          { x: 5, y: 5 }
        ],
        3
      )
    ).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 }
    ])
  })
})

describe('simplify', () => {
  it('reduces a jittery square to its corners', () => {
    const jittery = resample(square, 80).map((point, index) => ({
      x: point.x + (index % 2 ? 1 : -1),
      y: point.y
    }))
    const corners = simplify(jittery, 5)
    expect(corners).toHaveLength(5)
    expect(corners[2].x).toBeCloseTo(100, -1)
    expect(corners[2].y).toBeCloseTo(100, -1)
  })

  it('keeps a straight line as its two ends', () => {
    expect(
      simplify(
        [
          { x: 0, y: 0 },
          { x: 50, y: 1 },
          { x: 100, y: 0 }
        ],
        2
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    ])
  })
})

describe('isClosed', () => {
  it('accepts a loop whose ends almost meet', () => {
    expect(isClosed([...square.slice(0, 4), { x: 0, y: 20 }])).toBe(true)
  })

  it('rejects an open path', () => {
    expect(isClosed(square.slice(0, 3))).toBe(false)
  })
})

describe('angleAt', () => {
  it('measures the interior angle at a vertex', () => {
    expect(angleAt({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 })).toBeCloseTo(180)
    expect(angleAt({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 })).toBeCloseTo(90)
    expect(angleAt({ x: 10, y: 10 }, { x: 10, y: 0 }, { x: 0, y: 0 })).toBeCloseTo(90)
  })
})

describe('rotate', () => {
  it('turns points around the origin', () => {
    const [point] = rotate([{ x: 10, y: 0 }], Math.PI / 2, { x: 0, y: 0 })
    expect(point.x).toBeCloseTo(0)
    expect(point.y).toBeCloseTo(10)
  })
})

describe('smooth', () => {
  it('cuts corners and keeps the ends in place', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 }
    ]
    const result = smooth(path, 1)
    expect(result[0]).toEqual(path[0])
    expect(result[result.length - 1]).toEqual(path[2])
    expect(result).not.toContainEqual({ x: 100, y: 0 })
  })
})
