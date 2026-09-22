import { Circle, Diamond, Hexagon, Square, Triangle } from 'lucide-react'

export const seedObjects = [
  {
    id: 'welcome',
    type: 'sticky',
    x: 190,
    y: 145,
    w: 250,
    h: 190,
    color: 'yellow',
    title: 'Start here',
    text: 'Write an idea, drop in a file, or use the toolbar to shape your thinking.'
  },
  {
    id: 'prompt',
    type: 'text',
    x: 535,
    y: 175,
    w: 280,
    h: 150,
    text: 'What are we trying to discover?\n\nStart with an open question and let the connections appear.'
  }
]

export const STICKY_COLORS = {
  yellow: '#fff0ad',
  pink: '#ffd9d1',
  blue: '#cfe9eb',
  green: '#d8ebc9',
  white: '#ffffff'
}

export const ACCENTS = [
  '#d86e50',
  '#577d6a',
  '#50739a',
  '#8a6b9f',
  '#c58a44',
  '#d1495b',
  '#2a9d8f',
  '#e76f51',
  '#264653',
  '#6c757d'
]

export const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'warm', label: 'Warm' },
  { id: 'mint', label: 'Mint' },
  { id: 'dark', label: 'Dark' },
  { id: 'oled', label: 'OLED' }
]

export const SHAPES = [
  { id: 'square', label: 'Square', icon: Square },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'triangle', label: 'Triangle', icon: Triangle },
  { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
  { id: 'diamond', label: 'Diamond', icon: Diamond }
]

export const STROKE_WIDTHS = [
  { value: 2, label: 'Fine' },
  { value: 4, label: 'Regular' },
  { value: 7, label: 'Bold' },
  { value: 11, label: 'Heavy' }
]

export const TOOL_SHORTCUTS = {
  v: 'select',
  h: 'hand',
  t: 'text',
  n: 'sticky',
  p: 'pen',
  l: 'connector'
}
