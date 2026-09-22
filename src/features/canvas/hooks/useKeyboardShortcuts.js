import { useEffect } from 'react'
import { TOOL_SHORTCUTS } from '@/features/board/lib/constants.js'

function isTyping() {
  return ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
}

// Global shortcuts. Re-subscribes on every render so handlers always see fresh state.
export function useKeyboardShortcuts({
  undo,
  redo,
  selectAll,
  copy,
  paste,
  remove,
  cancel,
  setTool
}) {
  useEffect(() => {
    const onKey = (event) => {
      const typing = isTyping()
      const mod = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      if (mod && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if (mod && key === 'y') {
        event.preventDefault()
        redo()
        return
      }
      const modActions = { a: selectAll, c: copy, v: paste }
      if (mod && modActions[key] && !typing) {
        event.preventDefault()
        modActions[key]()
        return
      }
      if (typing) return
      if (event.key === 'Delete' || event.key === 'Backspace') remove()
      if (event.key === 'Escape') cancel()
      const shortcut = TOOL_SHORTCUTS[key]
      if (shortcut) setTool(shortcut)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
}
