import { seedObjects } from './constants'
import type { Board } from '../types'
import { isBoard } from '../types'

export const STORAGE_KEYS = {
  boards: 'brainshake-boards-v1',
  theme: 'brainshake-theme',
  accent: 'brainshake-accent',
  dock: 'brainshake-dock',
  clipboard: 'brainshake-copy',
  fontSize: 'brainshake-font-size',
  highContrast: 'brainshake-high-contrast',
  reduceMotion: 'brainshake-reduce-motion',
  keyboardNavigation: 'brainshake-keyboard-navigation',
  enhancedFocus: 'brainshake-enhanced-focus',
  focusColor: 'brainshake-focus-color',
  tutorialCompleted: 'brainshake-accessibility-tour-complete',
  sidebarAutoHide: 'brainshake-sidebar-auto-hide',
  headerColor: 'brainshake-header-color',
  sidebarColor: 'brainshake-sidebar-color',
  canvasColor: 'brainshake-canvas-color',
  panelColor: 'brainshake-panel-color'
}

export function loadBoards(): Board[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEYS.boards) || 'null')
    if (Array.isArray(saved) && saved.length && saved.every(isBoard)) return saved
  } catch {
    // Corrupted data falls back to the seed board.
  }
  return [{ id: 'board-main', name: 'My first idea', objects: seedObjects }]
}

export function saveBoards(boards: Board[]) {
  localStorage.setItem(STORAGE_KEYS.boards, JSON.stringify(boards))
}
