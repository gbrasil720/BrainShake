import type React from 'react'
import { useRef, useState } from 'react'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { Sidebar } from '@/layout/Sidebar'
import { Topbar } from '@/layout/Topbar'
import { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import { Canvas } from '@/features/canvas/components/Canvas'
import { ContextMenu } from '@/features/canvas/components/ContextMenu'
import { ZoomControls } from '@/features/canvas/components/ZoomControls'
import { useCanvasPointer } from '@/features/canvas/hooks/useCanvasPointer'
import { useKeyboardShortcuts } from '@/features/canvas/hooks/useKeyboardShortcuts'
import { useViewport } from '@/features/canvas/hooks/useViewport'
import { ImageUrlDialog } from '@/features/import-export/components/ImageUrlDialog'
import { useImportExport } from '@/features/import-export/hooks/useImportExport'
import { usePreferences } from '@/features/preferences/usePreferences'
import { PropertiesPanel } from '@/features/properties/PropertiesPanel'
import { Toolbar } from '@/features/toolbar/Toolbar'
import { getFontScale, normalizeFontSize } from '@/features/accessibility/accessibility'
import { AccessibilityTour } from '@/features/accessibility/AccessibilityTour'
import { PresentationMode } from '@/features/presentation/PresentationMode'

export default function App() {
  const [toast, showToast] = useToast()
  const preferences = usePreferences()
  const viewport = useViewport()
  const editor = useBoardEditor({ viewport, showToast })
  const pointer = useCanvasPointer({ editor, viewport })
  const transfer = useImportExport({ editor, showToast })
  const [context, setContext] = useState<{ x: number; y: number } | null>(null)
  const [showPanel, setShowPanel] = useState(true)
  const [tourOpen, setTourOpen] = useState(false)
  const [presentationOpen, setPresentationOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const boardFileRef = useRef<HTMLInputElement>(null)
  const openFilePicker = () => fileRef.current?.click()
  const { board, selected } = editor

  const toggleSlides = () => {
    const selectedItems = board.objects.filter((item) => selected.includes(item.id))
    if (!selectedItems.length) return
    const shouldAdd = selectedItems.some((item) => !('slide' in item) || !item.slide)
    selectedItems.forEach((item) => editor.updateObject(item.id, { slide: shouldAdd }, false))
  }

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
    setTool: editor.setTool,
    enabled: preferences.keyboardNavigation
  })

  const fontScale = getFontScale(preferences.fontSize)
  return (
    <>
      <div
        className={`app theme-${preferences.theme} font-size-${normalizeFontSize(preferences.fontSize)} ${preferences.highContrast ? 'accessibility-high-contrast' : ''} ${preferences.reduceMotion ? 'reduce-motion' : ''} ${preferences.enhancedFocus ? 'enhanced-focus' : ''} ${preferences.sidebarAutoHide ? 'sidebar-auto-hide' : ''}`}
        style={
          {
            '--primary': preferences.accent,
            '--font-scale': fontScale,
            '--header-custom': preferences.headerColor || 'var(--paper)',
            '--sidebar-custom': preferences.sidebarColor || 'var(--paper)',
            '--canvas-custom': preferences.canvasColor || 'var(--surface)',
            '--panel-custom': preferences.panelColor || 'var(--paper)'
          } as React.CSSProperties
        }
        onClick={() => setContext(null)}
      >
        <Topbar
          editor={editor}
          transfer={transfer}
          onImportBoard={() => boardFileRef.current?.click()}
          onToggleSettings={() => setShowPanel((value) => !value)}
          onOpenTour={() => setTourOpen(true)}
          onOpenPresentation={() => setPresentationOpen(true)}
        />
        <Sidebar
          editor={editor}
          transfer={transfer}
          onImportFiles={openFilePicker}
          autoHide={preferences.sidebarAutoHide}
          preferences={preferences}
          onOpenTour={() => setTourOpen(true)}
        />
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
            autoHide={preferences.dockAutoHide}
            onToggleSlides={toggleSlides}
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
              if (event.target.files?.[0]) transfer.importBoardFile(event.target.files[0])
              event.target.value = ''
            }}
          />
        </main>
        <AccessibilityTour
          isOpen={tourOpen}
          preferences={preferences}
          onClose={() => setTourOpen(false)}
        />
        {presentationOpen && (
          <PresentationMode items={board.objects} onClose={() => setPresentationOpen(false)} />
        )}
      </div>
    </>
  )
}
