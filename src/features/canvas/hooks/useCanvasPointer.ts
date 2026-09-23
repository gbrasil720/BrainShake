import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { makeId } from '@/lib/id'
import {
  addObjects,
  finishStroke,
  moveObjects,
  patchObject,
  resizeStroke
} from '@/features/board/lib/objects'
import type { CanvasItem, Point } from '@/features/board/types'
import { isCanvasItem } from '@/features/board/types'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useViewport } from './useViewport'
import { canBeginCanvasPan, shouldPanWithSpace } from '@/features/toolbar/toolNavigation'
import { recognize, type Recognition } from '@/features/pen/lib/recognize'

const MIN_WIDTH = 100
const MIN_HEIGHT = 80
// Holding the pen still this long at the end of a stroke snaps it to a clean shape.
const HOLD_DELAY = 500
// Screen pixels the pointer may drift while held and still count as still.
const HOLD_TOLERANCE = 6

// Pointer interactions on the canvas. `dragging.type` is one of: move | resize | pan.
// Pen strokes in progress live in `drawing`.
type Dragging =
  | {
      type: 'move'
      pointerId: number
      ids: string[]
      start: Point
      origins: (Point & { id: string })[]
    }
  | {
      type: 'resize'
      pointerId: number
      id: string
      start: Point
      x: number
      y: number
      w: number
      h: number
      direction: string
      points?: Point[]
      fontSize?: number
    }
  | { type: 'pan'; pointerId: number; start: Point; origin: Point }

export type Drawing = CanvasItem & {
  points: Point[]
  strokeWidth: number
  // Shape the stroke snapped to while the pen was held still, applied on release.
  snapped?: Recognition | null
}

export function useCanvasPointer({
  editor,
  viewport,
  autoSnap = false,
  onSnap
}: {
  editor: ReturnType<typeof useBoardEditor>
  viewport: ReturnType<typeof useViewport>
  // Snap every stroke on release, not only the ones held still.
  autoSnap?: boolean
  onSnap?: (recognition: Recognition) => void
}) {
  const [dragging, setDragging] = useState<Dragging | null>(null)
  const [drawing, setDrawing] = useState<Drawing | null>(null)
  const spacePressed = useRef(false)
  const hold = useRef<{ timer: number; anchor: Point } | null>(null)
  const { board, commit, selected, setSelected, tool, setTool, strokeWidth } = editor
  const { screenPoint, pan, setPan } = viewport

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || isSpacePanControl(event.target)) return
      spacePressed.current = true
      event.preventDefault()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') spacePressed.current = false
    }
    const onBlur = () => {
      spacePressed.current = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => () => window.clearTimeout(hold.current?.timer), [])

  function cancelHold() {
    if (hold.current) window.clearTimeout(hold.current.timer)
    hold.current = null
  }

  // (Re)starts the countdown to snapping. The anchor outlives the timer, so jitter
  // after a snap doesn't undo it; only moving past HOLD_TOLERANCE does.
  function startHold(event: React.PointerEvent<HTMLDivElement>) {
    cancelHold()
    hold.current = {
      anchor: { x: event.clientX, y: event.clientY },
      timer: window.setTimeout(() => {
        setDrawing((current) => current && { ...current, snapped: recognize(current.points) })
      }, HOLD_DELAY)
    }
  }

  function isSpacePan(event: React.PointerEvent<HTMLDivElement>) {
    return shouldPanWithSpace({
      spacePressed: spacePressed.current,
      button: event.button,
      interactiveTarget: isSpacePanControl(event.target)
    })
  }

  function selectObject(event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) {
    event.stopPropagation()
    if (isSpacePan(event)) return
    if (event.button !== 0) return
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
    if (isSpacePan(event)) {
      event.preventDefault()
      event.stopPropagation()
      beginPan(event)
      return
    }
    if (tool !== 'select' || event.button !== 0 || item.locked) return
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
      pointerId: event.pointerId,
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
    if (isSpacePan(event)) {
      event.preventDefault()
      beginPan(event)
      return
    }
    if (tool !== 'select' || item.locked) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = screenPoint(event)
    const direction = event.currentTarget.dataset.direction || 'se'
    setDragging({
      type: 'resize',
      pointerId: event.pointerId,
      id: item.id,
      start: point,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      direction,
      points: item.type === 'stroke' ? item.points : undefined,
      fontSize: item.type === 'text' ? item.fontSize || 18 : undefined
    })
  }

  function beginPan(event: React.PointerEvent<HTMLDivElement>) {
    if (
      !canBeginCanvasPan({
        tool,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
        spacePressed: spacePressed.current,
        button: event.button
      })
    )
      return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
    event.stopPropagation()
    setDragging({
      type: 'pan',
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: pan
    })
  }

  function beginDrawing(event: React.PointerEvent<HTMLDivElement>) {
    if (tool !== 'pen' || event.button !== 0) return
    setSelected([])
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
      points: [{ x: 0, y: 0 }]
    })
    startHold(event)
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (isSpacePan(event)) {
      event.preventDefault()
      beginPan(event)
      return
    }
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
      const anchor = hold.current?.anchor
      const moved =
        !anchor || Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) > HOLD_TOLERANCE
      // Moving on after a snap goes back to freehand drawing.
      if (moved) startHold(event)
      setDrawing(
        (current) =>
          current && {
            ...current,
            snapped: moved ? null : current.snapped,
            points: [...current.points, { x: point.x - current.x, y: point.y - current.y }]
          }
      )
      return
    }
    if (!dragging) return
    if (event.pointerId !== dragging.pointerId) return
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
      const patch = {
        x: left ? dragging.x + dragging.w - nextW : dragging.x,
        y: top ? dragging.y + dragging.h - nextH : dragging.y,
        w: nextW,
        h: nextH,
        ...(dragging.fontSize !== undefined
          ? {
              fontSize: Math.min(
                160,
                Math.max(
                  8,
                  Math.round(
                    dragging.fontSize * Math.sqrt((nextW / dragging.w) * (nextH / dragging.h))
                  )
                )
              )
            }
          : {}),
        ...(dragging.points
          ? {
              points: resizeStroke(
                { w: dragging.w, h: dragging.h, points: dragging.points },
                nextW,
                nextH
              ).points
            }
          : {})
      }
      editor.updateObject(dragging.id, patch, false)
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
    if (dragging && event.pointerId !== dragging.pointerId) return
    if (drawing) {
      cancelHold()
      const { snapped: held, ...stroke } = drawing
      const snapped = held ?? (autoSnap ? recognize(stroke.points) : null)
      const drawn = finishStroke(stroke)
      commit((current) => addObjects(current, [drawn]))
      // A separate history entry, so undo brings back the stroke as it was drawn.
      if (snapped && event.type !== 'pointercancel') {
        const { x, y, w, h, points } = finishStroke({ ...stroke, points: snapped.points })
        commit((current) =>
          patchObject(current, drawn.id, { x, y, w, h, points, recognizedShape: snapped.kind })
        )
        onSnap?.(snapped)
      }
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
    beginDrawing,
    beginPan,
    onPointerDown,
    onPointerMove,
    onPointerUp
  }
}

function isSpacePanControl(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'button, input, textarea, select, a[href], [contenteditable], [role="textbox"], [role="button"], .markdown-preview'
      )
    )
  )
}
