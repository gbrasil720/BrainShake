import { useState } from 'react'
import { makeId } from '@/lib/id.js'
import { defaultSize } from '@/features/canvas/objects/registry.js'
import { STORAGE_KEYS } from '../lib/storage.js'
import {
  addObjects,
  bringToFront,
  createObject,
  duplicateObjects,
  patchObject,
  removeObjects
} from '../lib/objects.js'
import { useBoards } from './useBoards.js'
import { useHistory } from './useHistory.js'

// Active board + history + selection + current tool, and the actions that edit them.
export function useBoardEditor({ viewport, showToast }) {
  const boards = useBoards({
    onSaveError: () => showToast('Storage limit reached. Export your board to keep a backup.')
  })
  const history = useHistory({ getPresent: boards.getBoard, setPresent: boards.replaceBoard })
  const [selected, setSelected] = useState([])
  const [tool, setTool] = useState('select')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const { board } = boards
  const { commit } = history

  function switchBoard(id) {
    if (!boards.switchBoard(id)) return
    setSelected([])
    viewport.reset()
  }

  function createBoard() {
    boards.createBoard()
    setSelected([])
    history.reset()
  }

  function deleteBoard(id) {
    if (boards.deleteBoard(id)) setSelected([])
  }

  function undo() {
    if (history.undo()) setSelected([])
  }

  function redo() {
    if (history.redo()) setSelected([])
  }

  function addObject(type, data = {}, position) {
    const point = position || viewport.viewportCenter()
    const item = createObject(type, { ...defaultSize(type), ...data }, point)
    commit((current) => addObjects(current, [item]))
    setSelected([item.id])
    setTool('select')
  }

  function updateObject(id, patch, saveHistory = true) {
    commit((current) => patchObject(current, id, patch), saveHistory)
  }

  function removeObject(id) {
    commit((current) => removeObjects(current, [id]))
    setSelected((current) => current.filter((value) => value !== id))
  }

  function connect(fromId, toId) {
    commit((current) =>
      addObjects(current, [{ id: makeId('connector'), type: 'connector', from: fromId, to: toId }])
    )
  }

  function selectAll() {
    setSelected(board.objects.map((item) => item.id))
  }

  function removeSelection() {
    if (!selected.length) return
    commit((current) => removeObjects(current, selected))
    setSelected([])
    showToast('Item removed')
  }

  function duplicateSelection() {
    const copies = duplicateObjects(
      board.objects.filter((item) => selected.includes(item.id)),
      24
    )
    if (!copies.length) return
    commit((current) => addObjects(current, copies))
    setSelected(copies.map((item) => item.id))
  }

  function copySelection() {
    const items = board.objects.filter((item) => selected.includes(item.id))
    if (!items.length) return
    navigator.clipboard?.writeText(JSON.stringify(items))
    sessionStorage.setItem(STORAGE_KEYS.clipboard, JSON.stringify(items))
    showToast('Copied to clipboard')
  }

  function pasteSelection() {
    try {
      const items = duplicateObjects(
        JSON.parse(sessionStorage.getItem(STORAGE_KEYS.clipboard) || '[]'),
        32
      )
      if (!items.length) return
      commit((current) => addObjects(current, items))
      setSelected(items.map((item) => item.id))
    } catch {
      showToast('Could not paste')
    }
  }

  function bringSelectionToFront() {
    commit((current) => bringToFront(current, selected))
  }

  return {
    boards: boards.boards,
    board,
    renameBoard: boards.renameBoard,
    switchBoard,
    createBoard,
    deleteBoard,
    commit,
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    selected,
    setSelected,
    tool,
    setTool,
    strokeWidth,
    setStrokeWidth,
    addObject,
    updateObject,
    removeObject,
    connect,
    selectAll,
    removeSelection,
    duplicateSelection,
    copySelection,
    pasteSelection,
    bringSelectionToFront
  }
}
