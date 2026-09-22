import { BoxSelect, Link2, Upload } from 'lucide-react'
import { BoardList } from '@/features/board/components/BoardList.jsx'
import { ExportMenu } from '@/features/import-export/components/ExportMenu.jsx'
import { SidebarFooter } from './SidebarFooter.jsx'

export function Sidebar({ editor, transfer, onImportFiles }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="section-label">Workspace</div>
        <button className="nav-item active">
          <BoxSelect size={16} />
          <span>Canvas</span>
        </button>
        <button className="nav-item" onClick={onImportFiles}>
          <Upload size={16} />
          <span>Import</span>
        </button>
        <button className="nav-item" onClick={transfer.openUrlDialog}>
          <Link2 size={16} />
          <span>Import image URL</span>
        </button>
        <ExportMenu onExport={transfer.exportAsBrainshake} onExportJson={transfer.exportAsJson} />
      </div>
      <BoardList
        boards={editor.boards}
        activeId={editor.board.id}
        onCreate={editor.createBoard}
        onSwitch={editor.switchBoard}
        onDelete={editor.deleteBoard}
      />
      <SidebarFooter />
    </aside>
  )
}
