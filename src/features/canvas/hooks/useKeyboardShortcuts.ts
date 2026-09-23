import { useEffect } from 'react'
import { TOOL_SHORTCUTS } from '@/features/board/lib/constants'

function isTyping() {
  return ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')
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
  setTool,
  enabled,
  vimBindings
}: {
  undo: () => void
  redo: () => void
  selectAll: () => void
  copy: () => void
  paste: () => void
  remove: () => void
  cancel: () => void
  setTool: (tool: string) => void
  enabled: boolean
  vimBindings: boolean
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!enabled) return
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
      const modActions: Record<string, (() => void) | undefined> = {
        a: selectAll,
        c: copy,
        v: paste
      }
      if (mod && modActions[key] && !typing) {
        event.preventDefault()
        modActions[key]()
        return
      }
      if (typing) return
      if (event.key === 'Delete' || event.key === 'Backspace') remove()
      if (event.key === 'Escape') cancel()
      const shortcut = vimBindings
        ? ({ h: 'hand', v: 'select', t: 'text', n: 'sticky', p: 'pen' }[key] as string | undefined)
        : (TOOL_SHORTCUTS as Record<string, string | undefined>)[key]
      if (shortcut) setTool(shortcut)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cancel, copy, enabled, paste, redo, remove, selectAll, setTool, undo, vimBindings])
}
