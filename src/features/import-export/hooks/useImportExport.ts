import { useState } from 'react'
import { exportBrainshake, exportJson, importBrainshake } from '../lib/archive'
import { fileToObject } from '../lib/files'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useSnapshots } from '@/features/workspace/useSnapshots'
import { commitWorkspaceImport } from '@/features/workspace/import'
import { WorkspaceBusyError } from '@/features/workspace/operationGate'

export function useImportExport({
  editor,
  snapshots,
  showToast
}: {
  editor: ReturnType<typeof useBoardEditor>
  snapshots: ReturnType<typeof useSnapshots>
  showToast: (message: string) => void
}) {
  const [urlOpen, setUrlOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  async function importFiles(files: FileList | File[] | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      try {
        const object = await fileToObject(file)
        if (object) editor.addObject(object.type, object.data)
        else showToast(`Unsupported format: ${file.name}`)
      } catch {
        showToast(`Could not import ${file.name}`)
      }
    }
  }

  function submitImageUrl(url: string) {
    if (!/^https?:\/\//i.test(url)) {
      showToast('Enter a valid image URL')
      return
    }
    editor.addObject('image', { src: url, name: 'Web image' })
    setUrlOpen(false)
  }

  async function exportAsBrainshake() {
    try {
      const { snapshots: savedSnapshots, assets } = await snapshots.loadForExport()
      await exportBrainshake(
        {
          format: 'brainshake',
          schemaVersion: 2,
          id: editor.workspace.id,
          name: editor.workspace.name,
          activeBoardId: editor.board.id,
          headSnapshotId: snapshots.headId,
          boards: editor.boards,
          snapshots: savedSnapshots
        },
        assets
      )
      showToast('Workspace exported')
    } catch {
      showToast('Could not export workspace')
    }
  }

  function exportAsJson() {
    exportJson(editor.board)
    showToast('Board exported')
  }

  async function importBoardFile(file: File) {
    try {
      const imported = await importBrainshake(file)
      if (imported.kind === 'board') {
        await snapshots.runExclusive(async () => {
          editor.commit((current) => ({ ...current, ...imported.data, id: current.id }))
          editor.setSelected([])
        })
        showToast('Board imported')
        return
      }
      if (!window.confirm('Replace the current workspace and its snapshots with this file?')) return
      await snapshots.runExclusive(async () => {
        setImporting(true)
        try {
          await commitWorkspaceImport(
            imported.data,
            () =>
              snapshots.replaceAll(
                imported.data.snapshots,
                imported.data.headSnapshotId,
                imported.assets
              ),
            () =>
              editor.replaceWorkspace(
                imported.data.boards,
                imported.data.activeBoardId,
                imported.data.id,
                imported.data.name
              )
          )
        } finally {
          setImporting(false)
        }
      })
      showToast('Workspace imported')
    } catch (error) {
      showToast(
        error instanceof WorkspaceBusyError
          ? 'Wait for the current workspace operation'
          : error instanceof Error && error.name === 'QuotaExceededError'
            ? 'Browser storage is full; workspace import was not applied'
            : 'Could not import BrainShake file or save workspace'
      )
    }
  }

  return {
    urlOpen,
    importing,
    openUrlDialog: () => setUrlOpen(true),
    closeUrlDialog: () => setUrlOpen(false),
    submitImageUrl,
    importFiles,
    importBoardFile,
    exportAsBrainshake,
    exportAsJson
  }
}
