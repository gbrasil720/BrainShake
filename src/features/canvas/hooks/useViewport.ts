import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import type { Point } from '@/features/board/types'

export const MIN_ZOOM = 0.35
export const MAX_ZOOM = 2.4
const ZOOM_STEP = 0.1

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

export function useViewport() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoomState] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const setZoom = useCallback((value: number) => setZoomState(clampZoom(value)), [])

  // Converts a pointer position (clientX/clientY) into board coordinates.
  function screenPoint(event: { clientX: number; clientY: number }): Point {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left - pan.x) / zoom,
      y: (event.clientY - rect.top - pan.y) / zoom
    }
  }

  function viewportCenter() {
    return screenPoint({ clientX: window.innerWidth * 0.52, clientY: window.innerHeight * 0.48 })
  }

  function onWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    const point = screenPoint(event)
    const delta =
      event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * rect.height
          : event.deltaY
    const nextZoom = clampZoom(zoom * Math.pow(0.9985, delta))
    setZoomState(nextZoom)
    setPan({
      x: event.clientX - rect.left - point.x * nextZoom,
      y: event.clientY - rect.top - point.y * nextZoom
    })
  }

  function zoomIn() {
    setZoomState((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
  }

  function zoomOut() {
    setZoomState((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))
  }

  function reset() {
    setPan({ x: 0, y: 0 })
    setZoomState(1)
  }

  function fitContent(hasObjects: boolean) {
    if (!hasObjects) {
      reset()
      return
    }
    setZoomState(0.8)
    setPan({ x: 80, y: 30 })
  }

  return {
    canvasRef,
    zoom,
    pan,
    setPan,
    setZoom,
    screenPoint,
    viewportCenter,
    onWheel,
    zoomIn,
    zoomOut,
    reset,
    fitContent
  }
}
