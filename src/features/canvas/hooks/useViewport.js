import { useRef, useState } from 'react'

const MIN_ZOOM = 0.35
const MAX_ZOOM = 2.4
const ZOOM_STEP = 0.1

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

export function useViewport() {
  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Converts a pointer position (clientX/clientY) into board coordinates.
  function screenPoint(event) {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left - pan.x) / zoom,
      y: (event.clientY - rect.top - pan.y) / zoom
    }
  }

  function viewportCenter() {
    return screenPoint({ clientX: window.innerWidth * 0.52, clientY: window.innerHeight * 0.48 })
  }

  function onWheel(event) {
    event.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const point = screenPoint(event)
    const delta =
      event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * rect.height
          : event.deltaY
    const nextZoom = clampZoom(zoom * Math.pow(0.9985, delta))
    setZoom(nextZoom)
    setPan({
      x: event.clientX - rect.left - point.x * nextZoom,
      y: event.clientY - rect.top - point.y * nextZoom
    })
  }

  function zoomIn() {
    setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
  }

  function zoomOut() {
    setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))
  }

  function reset() {
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }

  function fitContent(hasObjects) {
    if (!hasObjects) {
      reset()
      return
    }
    setZoom(0.8)
    setPan({ x: 80, y: 30 })
  }

  return {
    canvasRef,
    zoom,
    pan,
    setPan,
    screenPoint,
    viewportCenter,
    onWheel,
    zoomIn,
    zoomOut,
    reset,
    fitContent
  }
}
