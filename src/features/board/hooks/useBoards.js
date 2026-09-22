import { useEffect, useRef, useState } from 'react'
import { makeId } from '@/lib/id.js'
import { loadBoards, saveBoards } from '../lib/storage.js'

export function useBoards({ onSaveError }) {
  const [boards, setBoards] = useState(loadBoards)
  const [board, setBoard] = useState(() => boards[0])
  // Latest board, readable synchronously between renders (async imports, pointer moves).
  const boardRef = useRef(board)

  useEffect(() => {
    try {
      saveBoards(boards)
    } catch {
      onSaveError()
    }
  }, [boards]) // eslint-disable-line react-hooks/exhaustive-deps

  function getBoard() {
    return boardRef.current
  }

  // Replaces the active board and writes it back into the list, matched by id.
  function replaceBoard(next) {
    boardRef.current = next
    setBoard(next)
    setBoards((current) => current.map((item) => (item.id === next.id ? next : item)))
  }

  function renameBoard(name) {
    replaceBoard({ ...boardRef.current, name })
  }

  function createBoard() {
    const next = { id: makeId('board'), name: `Board ${boards.length + 1}`, objects: [] }
    setBoards((current) => [...current, next])
    replaceBoard(next)
  }

  // Returns false when nothing changed.
  function switchBoard(id) {
    const next = boards.find((item) => item.id === id)
    if (!next || next.id === board.id) return false
    replaceBoard(next)
    return true
  }

  // Returns false when the board cannot be deleted (last board).
  function deleteBoard(id) {
    if (boards.length < 2) return false
    const nextBoards = boards.filter((item) => item.id !== id)
    setBoards(nextBoards)
    if (board.id === id) replaceBoard(nextBoards[0])
    return true
  }

  return {
    boards,
    board,
    getBoard,
    replaceBoard,
    renameBoard,
    createBoard,
    switchBoard,
    deleteBoard
  }
}
