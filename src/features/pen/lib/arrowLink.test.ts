import { describe, expect, it } from 'vitest'
import type { BoardItem } from '@/features/board/types'
import { arrowLink } from './arrowLink'

const objects: BoardItem[] = [
  { id: 'a', type: 'sticky', x: 0, y: 0, w: 100, h: 100 },
  { id: 'b', type: 'sticky', x: 300, y: 0, w: 100, h: 100 },
  { id: 'top', type: 'text', x: 320, y: 20, w: 40, h: 40 },
  { id: 'box', type: 'stroke', x: 0, y: 300, w: 100, h: 100, recognizedShape: 'square' },
  { id: 'scribble', type: 'stroke', x: 300, y: 300, w: 100, h: 100 },
  { id: 'link', type: 'connector', from: 'a', to: 'b' }
]

describe('arrowLink', () => {
  it('links the objects under the tail and the tip', () => {
    expect(arrowLink(objects, { x: 50, y: 50 }, { x: 305, y: 90 })).toEqual(['a', 'b'])
  })

  it('accepts ends that land just outside an object', () => {
    expect(arrowLink(objects, { x: 108, y: 50 }, { x: 292, y: 50 })).toEqual(['a', 'b'])
  })

  it('picks the topmost object', () => {
    expect(arrowLink(objects, { x: 50, y: 50 }, { x: 340, y: 40 })).toEqual(['a', 'top'])
  })

  it('links snapped pen shapes but not freehand strokes', () => {
    expect(arrowLink(objects, { x: 50, y: 50 }, { x: 50, y: 350 })).toEqual(['a', 'box'])
    expect(arrowLink(objects, { x: 50, y: 50 }, { x: 350, y: 350 })).toBeNull()
  })

  it('needs two different objects', () => {
    expect(arrowLink(objects, { x: 50, y: 50 }, { x: 200, y: 50 })).toBeNull()
    expect(arrowLink(objects, { x: 10, y: 10 }, { x: 90, y: 90 })).toBeNull()
  })
})
