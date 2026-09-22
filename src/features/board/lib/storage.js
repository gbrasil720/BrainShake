import { seedObjects } from './constants.js'

export const STORAGE_KEYS = {
  boards: 'brainshake-boards-v1',
  theme: 'brainshake-theme',
  accent: 'brainshake-accent',
  dock: 'brainshake-dock',
  clipboard: 'brainshake-copy'
}

export function loadBoards() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.boards))
    if (Array.isArray(saved) && saved.length) return saved
  } catch {
    // Corrupted data falls back to the seed board.
  }
  return [{ id: 'board-main', name: 'My first idea', objects: seedObjects }]
}

export function saveBoards(boards) {
  localStorage.setItem(STORAGE_KEYS.boards, JSON.stringify(boards))
}
