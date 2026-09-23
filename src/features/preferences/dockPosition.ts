import { STORAGE_KEYS } from '@/features/board/lib/storage'

const DOCK_DEFAULT_MIGRATION_KEY = `${STORAGE_KEYS.dock}-default-top-v1`
const DOCK_POSITIONS = ['top', 'right', 'bottom', 'left']

export function loadDockPosition(storage: Pick<Storage, 'getItem' | 'setItem'>) {
  if (storage.getItem(DOCK_DEFAULT_MIGRATION_KEY) !== 'done') {
    storage.setItem(STORAGE_KEYS.dock, JSON.stringify('top'))
    storage.setItem(DOCK_DEFAULT_MIGRATION_KEY, 'done')
    return 'top'
  }

  const stored = storage.getItem(STORAGE_KEYS.dock)
  if (stored === null) return 'top'

  try {
    const position: unknown = JSON.parse(stored)
    return typeof position === 'string' && DOCK_POSITIONS.includes(position) ? position : 'top'
  } catch {
    return 'top'
  }
}
