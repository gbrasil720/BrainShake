import { useState } from 'react'
import { exportBrainshake, exportJson, importBoard } from '../lib/archive'
import { fileToObject } from '../lib/files'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'

export function useImportExport({
  editor,
  showToast
}: {
  editor: ReturnType<typeof useBoardEditor>
  showToast: (message: string) => void
}) {
  const [urlOpen, setUrlOpen] = useState(false)

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
    await exportBrainshake(editor.board)
    showToast('Board exported')
  }

  function exportAsJson() {
    exportJson(editor.board)
    showToast('Board exported')
  }

  async function importBoardFile(file: File) {
    try {
      const data = await importBoard(file)
      editor.commit((current) => ({ ...current, ...data, id: current.id }))
      editor.setSelected([])
      showToast('Board imported')
    } catch {
      showToast('Invalid BrainShake file')
    }
  }

  return {
    urlOpen,
    openUrlDialog: () => setUrlOpen(true),
    closeUrlDialog: () => setUrlOpen(false),
    submitImageUrl,
    importFiles,
    importBoardFile,
    exportAsBrainshake,
    exportAsJson
  }
}
