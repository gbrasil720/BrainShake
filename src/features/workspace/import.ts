import { STORAGE_KEYS } from '@/features/board/lib/storage'
import type { WorkspaceDocument } from './model'
import { isWorkspaceDocument } from './model'

type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const IMPORT_KEYS = [
  STORAGE_KEYS.boards,
  STORAGE_KEYS.activeBoard,
  STORAGE_KEYS.workspaceId,
  STORAGE_KEYS.workspaceName,
  STORAGE_KEYS.snapshotHead
] as const

function stageWorkingCopy(document: WorkspaceDocument, storage: BrowserStorage): () => void {
  const previous = new Map(IMPORT_KEYS.map((key) => [key, storage.getItem(key)]))
  const next = new Map<string, string | null>([
    [STORAGE_KEYS.boards, JSON.stringify(document.boards)],
    [STORAGE_KEYS.activeBoard, document.activeBoardId],
    [STORAGE_KEYS.workspaceId, document.id],
    [STORAGE_KEYS.workspaceName, document.name],
    [STORAGE_KEYS.snapshotHead, document.headSnapshotId]
  ])
  const restore = () => {
    for (const key of IMPORT_KEYS) {
      const value = previous.get(key)
      if (value === null || value === undefined) storage.removeItem(key)
      else storage.setItem(key, value)
    }
    storage.removeItem(STORAGE_KEYS.pendingImport)
  }

  try {
    storage.setItem(STORAGE_KEYS.boards, JSON.stringify(document.boards))
    storage.setItem(STORAGE_KEYS.activeBoard, document.activeBoardId)
    storage.setItem(STORAGE_KEYS.workspaceId, document.id)
    storage.setItem(STORAGE_KEYS.workspaceName, document.name)
    if (document.headSnapshotId) storage.setItem(STORAGE_KEYS.snapshotHead, document.headSnapshotId)
    else storage.removeItem(STORAGE_KEYS.snapshotHead)
    storage.setItem(
      STORAGE_KEYS.pendingImport,
      JSON.stringify({
        state: 'staged',
        previous: Object.fromEntries(previous),
        next: Object.fromEntries(next)
      })
    )
  } catch (error) {
    restore()
    throw error
  }
  return restore
}

// The working copy must fit in browser storage before the IndexedDB snapshot swap.
export async function commitWorkspaceImport(
  document: WorkspaceDocument,
  replaceSavedSnapshots: () => Promise<void>,
  activateWorkspace: () => void,
  storage: BrowserStorage = localStorage
): Promise<void> {
  if (!isWorkspaceDocument(document)) throw Error('Invalid workspace')
  const restorePrevious = stageWorkingCopy(document, storage)
  try {
    await replaceSavedSnapshots()
    storage.setItem(
      STORAGE_KEYS.pendingImport,
      JSON.stringify({
        state: 'committed',
        previous: {},
        next: Object.fromEntries(IMPORT_KEYS.map((key) => [key, storage.getItem(key)]))
      })
    )
    storage.removeItem(STORAGE_KEYS.pendingImport)
  } catch (error) {
    restorePrevious()
    throw error
  }
  activateWorkspace()
}
