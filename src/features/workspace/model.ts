import type { Board } from '@/features/board/types'
import { isBoard } from '@/features/board/types'

export type WorkspaceSnapshot = {
  id: string
  parentId: string | null
  label: string
  createdAt: string
  activeBoardId: string
  boards: Board[]
}

export type WorkspaceDocument = {
  format: 'brainshake'
  schemaVersion: 2
  id: string
  name: string
  activeBoardId: string
  headSnapshotId: string | null
  boards: Board[]
  snapshots: WorkspaceSnapshot[]
}

export type SnapshotSummary = Pick<WorkspaceSnapshot, 'id' | 'parentId' | 'label' | 'createdAt'>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

function isBoardSet(boards: unknown, activeBoardId: unknown): boards is Board[] {
  return (
    Array.isArray(boards) &&
    boards.length > 0 &&
    boards.every(isBoard) &&
    new Set(boards.map((board) => board.id)).size === boards.length &&
    typeof activeBoardId === 'string' &&
    boards.some((board) => board.id === activeBoardId)
  )
}

export function isWorkspaceSnapshot(value: unknown): value is WorkspaceSnapshot {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    (value.parentId === null || typeof value.parentId === 'string') &&
    isBoardSet(value.boards, value.activeBoardId)
  )
}

export function isValidSnapshotGraph(
  snapshots: WorkspaceSnapshot[],
  headSnapshotId: string | null = null
): boolean {
  const ids = new Set(snapshots.map((snapshot) => snapshot.id))
  if (ids.size !== snapshots.length) return false
  if (headSnapshotId !== null && !ids.has(headSnapshotId)) return false
  if (snapshots.some((snapshot) => snapshot.parentId !== null && !ids.has(snapshot.parentId)))
    return false

  const byId = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]))
  for (const snapshot of snapshots) {
    const visited = new Set<string>()
    let current: WorkspaceSnapshot | undefined = snapshot
    while (current) {
      if (visited.has(current.id)) return false
      visited.add(current.id)
      current = current.parentId ? byId.get(current.parentId) : undefined
    }
  }
  return true
}

export function isWorkspaceDocument(value: unknown): value is WorkspaceDocument {
  if (
    !isRecord(value) ||
    value.format !== 'brainshake' ||
    value.schemaVersion !== 2 ||
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    !isBoardSet(value.boards, value.activeBoardId) ||
    !Array.isArray(value.snapshots) ||
    !value.snapshots.every(isWorkspaceSnapshot)
  )
    return false

  return (
    (typeof value.headSnapshotId === 'string' || value.headSnapshotId === null) &&
    isValidSnapshotGraph(value.snapshots, value.headSnapshotId)
  )
}
