import type React from 'react'
import { useState } from 'react'
import { makeId } from '@/lib/id'
import { addObjects, finishStroke, moveObjects } from '@/features/board/lib/objects'
import type { CanvasItem, Point } from '@/features/board/types'
import { isCanvasItem } from '@/features/board/types'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useViewport } from './useViewport'

const MIN_WIDTH = 100
const MIN_HEIGHT = 80

// Pointer interactions on the canvas. `dragging.type` is one of: move | resize | pan.
// Pen strokes in progress live in `drawing`.
type Dragging =
  | { type: 'move'; ids: string[]; start: Point; origins: (Point & { id: string })[] }
  | {
      type: 'resize'
      id: string
      start: Point
      x: number
      y: number
      w: number
      h: number
      direction: string
    }
  | { type: 'pan'; start: Point; origin: Point }

export function useCanvasPointer({
  editor,
  viewport,
  fillColor,
  strokeColor
}: {
  editor: ReturnType<typeof useBoardEditor>
  viewport: ReturnType<typeof useViewport>
  fillColor: string
  strokeColor: string
}) {
  const [dragging, setDragging] = useState<Dragging | null>(null)
  const [drawing, setDrawing] = useState<
    (CanvasItem & { points: Point[]; strokeWidth: number }) | null
  >(null)
  const { board, commit, selected, setSelected, tool, setTool, strokeWidth } = editor
  const { screenPoint, pan, setPan } = viewport

  function selectObject(event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) {
    event.stopPropagation()
    if (event.button !== 0) return
    if (tool === 'fill') {
      if (item.type === 'shape' || item.type === 'sticky') {
        editor.updateObject(
          item.id,
          item.type === 'shape' ? { fillColor, fill: 'solid' } : { fillColor },
          true
        )
        setSelected([item.id])
      }
      return
    }
    if (tool === 'connector') {
      if (!selected.length) setSelected([item.id])
      else if (selected[0] !== item.id) {
        const first = board.objects.find((object) => object.id === selected[0])
        if (first) editor.connect(first.id, item.id)
        setSelected([])
        setTool('select')
      }
      return
    }
    if (event.shiftKey || event.ctrlKey || event.metaKey)
      setSelected((current) =>
        current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
      )
    else if (!selected.includes(item.id)) setSelected([item.id])
  }

  function beginDrag(event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) {
    if (tool !== 'select' || ![0, 1, 2].includes(event.button) || item.locked) return
    if (
      (event.target as Element).closest('textarea, .markdown-preview') &&
      event.button === 0 &&
      event.buttons === 1
    )
      return
    if (event.button !== 0) event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = screenPoint(event)
    const ids = selected.includes(item.id) ? selected : [item.id]
    if (!selected.includes(item.id)) setSelected([item.id])
    setDragging({
      type: 'move',
      ids,
      start: point,
      origins: board.objects
        .filter(isCanvasItem)
        .filter((object) => ids.includes(object.id))
        .map((object) => ({ id: object.id, x: object.x, y: object.y }))
    })
  }

  function beginResize(event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) {
    event.stopPropagation()
    const point = screenPoint(event)
    const direction =
      (event.currentTarget.className.match(/resize-(nw|n|ne|e|se|s|sw|w)/) || [])[1] || 'se'
    setDragging({
      type: 'resize',
      id: item.id,
      start: point,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      direction
    })
  }

  function beginPan(event: React.PointerEvent<HTMLDivElement>) {
    if (tool !== 'hand' || event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
    setDragging({ type: 'pan', start: { x: event.clientX, y: event.clientY }, origin: pan })
  }

  function beginDrawing(event: React.PointerEvent<HTMLDivElement>) {
    if (tool !== 'pen' || event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = screenPoint(event)
    setDrawing({
      id: makeId('stroke'),
      type: 'stroke',
      x: point.x,
      y: point.y,
      w: 500,
      h: 500,
      strokeWidth,
      strokeColor,
      points: [{ x: 0, y: 0 }]
    })
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    const point = screenPoint(event)
    if (tool === 'text' || tool === 'sticky') {
      editor.addObject(tool, {}, point)
      return
    }
    setSelected([])
    beginPan(event)
    beginDrawing(event)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (drawing) {
      const point = screenPoint(event)
      setDrawing(
        (current) =>
          current && {
            ...current,
            points: [...current.points, { x: point.x - current.x, y: point.y - current.y }]
          }
      )
      return
    }
    if (!dragging) return
    if (dragging.type === 'pan') {
      setPan({
        x: dragging.origin.x + event.clientX - dragging.start.x,
        y: dragging.origin.y + event.clientY - dragging.start.y
      })
      return
    }
    const point = screenPoint(event)
    if (dragging.type === 'resize') {
      const dx = point.x - dragging.start.x
      const dy = point.y - dragging.start.y
      const left = dragging.direction.includes('w')
      const top = dragging.direction.includes('n')
      const nextW = Math.max(
        MIN_WIDTH,
        dragging.w + (left ? -dx : dragging.direction.includes('e') ? dx : 0)
      )
      const nextH = Math.max(
        MIN_HEIGHT,
        dragging.h + (top ? -dy : dragging.direction.includes('s') ? dy : 0)
      )
      editor.updateObject(
        dragging.id,
        {
          x: left ? dragging.x + dragging.w - nextW : dragging.x,
          y: top ? dragging.y + dragging.h - nextH : dragging.y,
          w: nextW,
          h: nextH
        },
        false
      )
    }
    if (dragging.type === 'move')
      commit(
        (current) =>
          moveObjects(
            current,
            dragging.origins,
            point.x - dragging.start.x,
            point.y - dragging.start.y
          ),
        false
      )
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (drawing) {
      commit((current) => addObjects(current, [finishStroke(drawing)]))
      setDrawing(null)
    }
    if (event?.currentTarget?.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    setDragging(null)
  }

  return {
    dragging,
    drawing,
    isPanning: dragging?.type === 'pan',
    selectObject,
    beginDrag,
    beginResize,
    onPointerDown,
    onPointerMove,
    onPointerUp
  }
}
