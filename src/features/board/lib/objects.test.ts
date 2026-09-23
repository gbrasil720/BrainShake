import { describe, expect, it } from 'vitest'
import { resizeStroke } from './objects'

describe('resizeStroke', () => {
  it('scales the drawn points with the resized frame', () => {
    const stroke = {
      w: 100,
      h: 80,
      points: [
        { x: 0, y: 0 },
        { x: 25, y: 20 },
        { x: 100, y: 80 }
      ]
    }

    expect(resizeStroke(stroke, 200, 160)).toEqual({
      w: 200,
      h: 160,
      points: [
        { x: 0, y: 0 },
        { x: 50, y: 40 },
        { x: 200, y: 160 }
      ]
    })
    expect(stroke.points[1]).toEqual({ x: 25, y: 20 })
  })

  it('does not change the unchanged axis when resizing from an edge', () => {
    expect(resizeStroke({ w: 100, h: 80, points: [{ x: 50, y: 40 }] }, 150, 80)).toEqual({
      w: 150,
      h: 80,
      points: [{ x: 75, y: 40 }]
    })
  })
})
