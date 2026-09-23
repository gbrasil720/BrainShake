import { useEffect, useRef, useState } from 'react'
import { makeId } from '@/lib/id'
import { STORAGE_KEYS } from '@/features/board/lib/storage'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { SnapshotSummary, WorkspaceSnapshot } from './model'
import { createWorkspaceOperationGate, WorkspaceBusyError } from './operationGate'
import {
  listSnapshots,
  loadArchiveSnapshots,
  loadSnapshot,
  replaceSnapshots,
  saveSnapshot
} from './storage'

function summarize(snapshot: WorkspaceSnapshot): SnapshotSummary {
  const { id, parentId, label, createdAt } = snapshot
  return { id, parentId, label, createdAt }
}

export function useSnapshots({
  editor,
  showToast
}: {
  editor: ReturnType<typeof useBoardEditor>
  showToast: (message: string) => void
}) {
  const [items, setItems] = useState<SnapshotSummary[]>([])
  const [headId, setHeadId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEYS.snapshotHead) || null
  )
  const [busy, setBusy] = useState(false)
  const gateRef = useRef(createWorkspaceOperationGate())
  const changesRef = useRef(0)

  useEffect(() => {
    const expected = changesRef.current
    listSnapshots()
      .then((loaded) => {
        if (changesRef.current === expected) setItems(loaded)
      })
      .catch(() => showToast('Could not load snapshots'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function updateHead(id: string | null) {
    setHeadId(id)
    if (id) localStorage.setItem(STORAGE_KEYS.snapshotHead, id)
    else localStorage.removeItem(STORAGE_KEYS.snapshotHead)
  }

  function currentSnapshot(label: string, parentId: string | null): WorkspaceSnapshot {
    return {
      id: makeId('snapshot'),
      parentId,
      label,
      createdAt: new Date().toISOString(),
      activeBoardId: editor.board.id,
      boards: editor.boards
    }
  }

  function runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    return gateRef.current.run(async () => {
      setBusy(true)
      try {
        return await operation()
      } finally {
        setBusy(false)
      }
    })
  }

  async function create(label: string) {
    try {
      return await runExclusive(async () => {
        const snapshot = currentSnapshot(label.trim() || 'Checkpoint', headId)
        await saveSnapshot(snapshot)
        changesRef.current += 1
        setItems((current) => [summarize(snapshot), ...current])
        updateHead(snapshot.id)
        showToast('Snapshot saved')
        return true
      })
    } catch (error) {
      showToast(
        error instanceof WorkspaceBusyError ? 'Workspace is busy' : 'Could not save snapshot'
      )
      return false
    }
  }

  async function restore(id: string) {
    try {
      await runExclusive(async () => {
        const target = await loadSnapshot(id)
        const safety = currentSnapshot(`Before restoring ${target.label}`, headId)
        await saveSnapshot(safety)
        editor.replaceWorkspace(
          target.boards,
          target.activeBoardId,
          editor.workspace.id,
          editor.workspace.name
        )
        changesRef.current += 1
        setItems((current) => [summarize(safety), ...current])
        updateHead(target.id)
        showToast('Snapshot restored; previous state was saved')
      })
    } catch (error) {
      showToast(
        error instanceof WorkspaceBusyError ? 'Workspace is busy' : 'Could not restore snapshot'
      )
    }
  }

  async function replaceAll(
    snapshots: WorkspaceSnapshot[],
    head: string | null,
    assets?: Map<string, Blob>
  ) {
    await replaceSnapshots(snapshots, assets)
    changesRef.current += 1
    setItems(snapshots.map(summarize).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    setHeadId(head)
  }

  return {
    items,
    headId,
    busy,
    create,
    restore,
    replaceAll,
    runExclusive,
    loadForExport: loadArchiveSnapshots
  }
}
