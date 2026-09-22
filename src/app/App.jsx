import { useRef, useState } from 'react'
import { Toast } from '@/components/Toast.jsx'
import { useToast } from '@/hooks/useToast.js'
import { Sidebar } from '@/layout/Sidebar.jsx'
import { Topbar } from '@/layout/Topbar.jsx'
import { useBoardEditor } from '@/features/board/hooks/useBoardEditor.js'
import { Canvas } from '@/features/canvas/components/Canvas.jsx'
import { ContextMenu } from '@/features/canvas/components/ContextMenu.jsx'
import { ZoomControls } from '@/features/canvas/components/ZoomControls.jsx'
import { useCanvasPointer } from '@/features/canvas/hooks/useCanvasPointer.js'
import { useKeyboardShortcuts } from '@/features/canvas/hooks/useKeyboardShortcuts.js'
import { useViewport } from '@/features/canvas/hooks/useViewport.js'
import { ImageUrlDialog } from '@/features/import-export/components/ImageUrlDialog.jsx'
import { useImportExport } from '@/features/import-export/hooks/useImportExport.js'
import { usePreferences } from '@/features/preferences/usePreferences.js'
import { PropertiesPanel } from '@/features/properties/PropertiesPanel.jsx'
import { Toolbar } from '@/features/toolbar/Toolbar.jsx'

export default function App() {
  const [toast, showToast] = useToast()
  const preferences = usePreferences()
  const viewport = useViewport()
  const editor = useBoardEditor({ viewport, showToast })
  const pointer = useCanvasPointer({ editor, viewport })
  const transfer = useImportExport({ editor, showToast })
  const [context, setContext] = useState(null)
  const [showPanel, setShowPanel] = useState(true)
  const fileRef = useRef(null)
  const boardFileRef = useRef(null)
  const openFilePicker = () => fileRef.current?.click()
  const { board, selected } = editor

  useKeyboardShortcuts({
    undo: editor.undo,
    redo: editor.redo,
    selectAll: editor.selectAll,
    copy: editor.copySelection,
    paste: editor.pasteSelection,
    remove: editor.removeSelection,
    cancel: () => {
      editor.setSelected([])
      editor.setTool('select')
      setContext(null)
    },
    setTool: editor.setTool
  })

  return (
    <div
      className={`app theme-${preferences.theme}`}
      style={{ '--accent': preferences.accent }}
      onClick={() => setContext(null)}
    >
      <Topbar
        editor={editor}
        transfer={transfer}
        onImportBoard={() => boardFileRef.current?.click()}
        onToggleSettings={() => setShowPanel((value) => !value)}
      />
      <Sidebar editor={editor} transfer={transfer} onImportFiles={openFilePicker} />
      <main className="workspace">
        <Canvas
          editor={editor}
          viewport={viewport}
          pointer={pointer}
          grid={preferences.grid}
          onImportFiles={transfer.importFiles}
          onContextMenu={setContext}
        />
        <Toolbar
          editor={editor}
          dockPosition={preferences.dockPosition}
          onDockChange={preferences.setDockPosition}
          onImportFiles={openFilePicker}
        />
        <ZoomControls
          zoom={viewport.zoom}
          onZoomIn={viewport.zoomIn}
          onZoomOut={viewport.zoomOut}
          onFit={() => viewport.fitContent(board.objects.length > 0)}
        />
        {showPanel && (
          <PropertiesPanel
            item={board.objects.find((item) => item.id === selected[0])}
            onChange={editor.updateObject}
            preferences={preferences}
            onClose={() => setShowPanel(false)}
          />
        )}
        {context && selected.length > 0 && (
          <ContextMenu
            position={context}
            onDuplicate={editor.duplicateSelection}
            onDelete={editor.removeSelection}
            onCopy={editor.copySelection}
            onFront={editor.bringSelectionToFront}
          />
        )}
        {transfer.urlOpen && (
          <ImageUrlDialog onClose={transfer.closeUrlDialog} onSubmit={transfer.submitImageUrl} />
        )}
        {toast && <Toast message={toast} />}
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*,.html,.md,.txt"
          onChange={(event) => {
            transfer.importFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <input
          ref={boardFileRef}
          type="file"
          hidden
          accept="application/json,application/zip,.json,.brainshake,.brainshake.json"
          onChange={(event) => {
            if (event.target.files[0]) transfer.importBoardFile(event.target.files[0])
            event.target.value = ''
          }}
        />
      </main>
    </div>
  )
}
