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
import {
  getFontScale,
  normalizeColorVision,
  normalizeFontSize
} from '@/features/accessibility/accessibility'
import { AccessibilityTour } from '@/features/accessibility/AccessibilityTour'

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
  const fileRef = useRef<HTMLInputElement>(null)
  const boardFileRef = useRef<HTMLInputElement>(null)
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
    setTool: editor.setTool,
    enabled: preferences.keyboardNavigation,
    vimBindings: preferences.vimBindings
  })

  const fontScale = getFontScale(preferences.fontSize)
  const colorVision = normalizeColorVision(preferences.colorVision)

  return (
    <>
      <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="achromatopsia">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 1 0"
          />
        </filter>
      </svg>
      <div
        className={`app theme-${preferences.theme} font-size-${normalizeFontSize(preferences.fontSize)} ${preferences.highContrast ? 'accessibility-high-contrast' : ''} ${preferences.reduceMotion ? 'reduce-motion' : ''} ${preferences.enhancedFocus ? 'enhanced-focus' : ''} color-vision-${colorVision}`}
        style={
          { '--primary': preferences.accent, '--font-scale': fontScale } as React.CSSProperties
        }
        onClick={() => setContext(null)}
      >
        <Topbar
          editor={editor}
          transfer={transfer}
          onImportBoard={() => boardFileRef.current?.click()}
          onToggleSettings={() => setShowPanel((value) => !value)}
          onOpenTour={() => setTourOpen(true)}
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
              onOpenTour={() => setTourOpen(true)}
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
      </div>
    </>
  )
}
