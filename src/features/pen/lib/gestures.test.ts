import { describe, expect, it } from 'vitest'
import type { BoardItem, Point } from '@/features/board/types'
import { recognizeGesture } from './gestures'

const objects: BoardItem[] = [
  { id: 'note', type: 'sticky', x: 0, y: 0, w: 200, h: 150 },
  { id: 'other', type: 'sticky', x: 400, y: 0, w: 200, h: 150 },
  { id: 'locked', type: 'sticky', x: 0, y: 400, w: 200, h: 150, locked: true },
  {
    id: 'line',
    type: 'stroke',
    x: 400,
    y: 400,
    w: 200,
    h: 10,
    strokeWidth: 4,
    points: [
      { x: 0, y: 5 },
      { x: 200, y: 5 }
    ]
  },
  { id: 'link', type: 'connector', from: 'note', to: 'other' }
]

// Zigzag across a box, `legs` times from side to side.
function zigzag(x: number, y: number, width: number, height: number, legs = 6): Point[] {
  return Array.from({ length: legs + 1 }, (_, index) => ({
    x: x + (index % 2 ? width : 0),
    y: y + (height * index) / legs
  }))
}

function loop(cx: number, cy: number, rx: number, ry: number): Point[] {
  return Array.from({ length: 50 }, (_, index) => ({
    x: cx + rx * Math.cos((index / 48) * 2 * Math.PI),
    y: cy + ry * Math.sin((index / 48) * 2 * Math.PI)
  }))
}

describe('recognizeGesture', () => {
  it('erases objects scribbled over', () => {
    expect(recognizeGesture(zigzag(40, 30, 120, 90), objects)).toEqual({
      type: 'erase',
      ids: ['note']
    })
  })

  it('erases a pen stroke the scribble crosses', () => {
    expect(recognizeGesture(zigzag(450, 370, 60, 70), objects)).toEqual({
      type: 'erase',
      ids: ['line']
    })
  })

  it('also sees scribbles that move down while going side to side', () => {
    expect(recognizeGesture(zigzag(60, 10, 60, 130, 10), objects)?.type).toBe('erase')
  })

  it('skips locked objects and empty space', () => {
    expect(recognizeGesture(zigzag(40, 430, 120, 90), objects)).toBeNull()
    expect(recognizeGesture(zigzag(250, 200, 100, 80), objects)).toBeNull()
  })

  it('does not treat a single zig or a line as a scribble', () => {
    expect(recognizeGesture(zigzag(40, 30, 120, 90, 2), objects)).toBeNull()
  })

  it('selects objects fully inside a loop', () => {
    expect(recognizeGesture(loop(300, 75, 360, 140), objects)).toEqual({
      type: 'select',
      ids: ['note', 'other']
    })
    expect(recognizeGesture(loop(100, 75, 150, 110), objects)).toEqual({
      type: 'select',
      ids: ['note']
    })
  })

  it('ignores loops that only cut through objects', () => {
    expect(recognizeGesture(loop(100, 75, 60, 40), objects)).toBeNull()
  })
})
