import { useState } from 'react'

const HISTORY_LIMIT = 40

// Undo/redo stacks for a value owned elsewhere (read with getPresent, written with setPresent).
export function useHistory({ getPresent, setPresent }) {
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])

  function commit(mutator, saveHistory = true) {
    const current = getPresent()
    setPresent(mutator(current))
    if (saveHistory) {
      setPast((items) => [...items.slice(-(HISTORY_LIMIT - 1)), current])
      setFuture([])
    }
  }

  // undo/redo return false when there is nothing to restore.
  function undo() {
    if (!past.length) return false
    const present = getPresent()
    setFuture((items) => [present, ...items])
    setPresent(past[past.length - 1])
    setPast((items) => items.slice(0, -1))
    return true
  }

  function redo() {
    if (!future.length) return false
    const present = getPresent()
    setPast((items) => [...items, present])
    setPresent(future[0])
    setFuture((items) => items.slice(1))
    return true
  }

  function reset() {
    setPast([])
    setFuture([])
  }

  return { commit, undo, redo, reset, canUndo: past.length > 0, canRedo: future.length > 0 }
}
