import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '@/features/board/types'
import { CanvasObject } from './CanvasObject'

const stroke: CanvasItem = {
  id: 'stroke-1',
  type: 'stroke',
  x: 0,
  y: 0,
  w: 100,
  h: 80,
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 80 }
  ]
}

function renderObject(activeTool: string, item = stroke) {
  return renderToStaticMarkup(
    createElement(CanvasObject, {
      item,
      selected: true,
      activeTool,
      presentingActive: false,
      onSelect: vi.fn(),
      onDrag: vi.fn(),
      onResize: vi.fn(),
      onChange: vi.fn(),
      onRemove: vi.fn()
    })
  )
}

describe('CanvasObject resize handles', () => {
  it('shows all resize handles for a selected object in select mode', () => {
    const markup = renderObject('select')
    expect(markup.match(/resize-handle resize-/g)).toHaveLength(8)
    expect([...markup.matchAll(/data-direction="([^"]+)"/g)].map((match) => match[1])).toEqual([
      'nw',
      'n',
      'ne',
      'e',
      'se',
      's',
      'sw',
      'w'
    ])
  })

  it('hides resize handles and selection framing while drawing with the pen', () => {
    const markup = renderObject('pen')
    expect(markup).not.toContain('resize-handle')
    expect(markup).not.toContain(' selected')
  })

  it('does not render resize handles for a locked object', () => {
    expect(renderObject('select', { ...stroke, locked: true })).not.toContain('resize-handle')
  })
})
