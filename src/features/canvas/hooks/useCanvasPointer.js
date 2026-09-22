import { useState } from 'react'
import { makeId } from '@/lib/id.js'
import { addObjects, finishStroke, moveObjects } from '@/features/board/lib/objects.js'

const MIN_WIDTH = 100
const MIN_HEIGHT = 80

// Pointer interactions on the canvas. `dragging.type` is one of: move | resize | pan.
// Pen strokes in progress live in `drawing`.
export function useCanvasPointer({ editor, viewport }) {
  const [dragging, setDragging] = useState(null)
  const [drawing, setDrawing] = useState(null)
  const { board, commit, selected, setSelected, tool, setTool, strokeWidth } = editor
  const { screenPoint, pan, setPan } = viewport

  function selectObject(event, item) {
    event.stopPropagation()
    if (tool === 'connector') {
      if (!selected.length) setSelected([item.id])
      else if (selected[0] !== item.id) {
        const first = board.objects.find((object) => object.id === selected[0])
        editor.connect(first.id, item.id)
        setSelected([])
        setTool('select')
      }
      return
    }
    if (event.shiftKey)
      setSelected((current) =>
        current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
      )
    else if (!selected.includes(item.id)) setSelected([item.id])
  }

  function beginDrag(event, item) {
    if (tool !== 'select' || ![0, 1, 2].includes(event.button) || item.locked) return
    if (
      event.target.closest('textarea, .markdown-preview') &&
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
        .filter((object) => ids.includes(object.id))
        .map((object) => ({ id: object.id, x: object.x, y: object.y }))
    })
  }

  function beginResize(event, item) {
    event.stopPropagation()
    const point = screenPoint(event)
    setDragging({ type: 'resize', id: item.id, start: point, w: item.w, h: item.h })
  }

  function beginPan(event) {
    if (tool !== 'hand' || event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
    setDragging({ type: 'pan', start: { x: event.clientX, y: event.clientY }, origin: pan })
  }

  function beginDrawing(event) {
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
      points: [{ x: 0, y: 0 }]
    })
  }

  function onPointerDown(event) {
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

  function onPointerMove(event) {
    if (drawing) {
      const point = screenPoint(event)
      setDrawing((current) => ({
        ...current,
        points: [...current.points, { x: point.x - current.x, y: point.y - current.y }]
      }))
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
    if (dragging.type === 'resize')
      editor.updateObject(
        dragging.id,
        {
          w: Math.max(MIN_WIDTH, dragging.w + point.x - dragging.start.x),
          h: Math.max(MIN_HEIGHT, dragging.h + point.y - dragging.start.y)
        },
        false
      )
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

  function onPointerUp(event) {
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
