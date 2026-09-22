import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useImportExport } from '@/features/import-export/hooks/useImportExport'
import { Settings2, Upload } from 'lucide-react'
import { BoardTitle } from '@/features/board/components/BoardTitle'
import { ExportMenu } from '@/features/import-export/components/ExportMenu'

export function Topbar({
  editor,
  transfer,
  onImportBoard,
  onToggleSettings,
  onOpenAccessibilityTour
}: {
  editor: ReturnType<typeof useBoardEditor>
  transfer: ReturnType<typeof useImportExport>
  onImportBoard: () => void
  onToggleSettings: () => void
  onOpenAccessibilityTour: () => void
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="BrainShake" />
        <span className="brand-name">BrainShake</span>
        <span className="brand-sub">workspace</span>
      </div>
      <BoardTitle name={editor.board.name} onRename={editor.renameBoard} />
      <div className="top-actions">
        <span className="save-state">
          <i className="save-dot" /> Saved locally
        </span>
        <ExportMenu
          onExport={transfer.exportAsBrainshake}
          onExportJson={transfer.exportAsJson}
          compact
        />
        <button
          className="icon-button"
          title="Accessibility Tour"
          onClick={onOpenAccessibilityTour}
          aria-label="Open accessibility tour"
        >
          <Settings2 size={17} />
        </button>
        <button className="icon-button" title="Import board" onClick={onImportBoard}>
          <Upload size={17} />
        </button>
        <button className="icon-button" title="Settings" onClick={onToggleSettings}>
          <Settings2 size={17} />
        </button>
      </div>
    </header>
  )
}
