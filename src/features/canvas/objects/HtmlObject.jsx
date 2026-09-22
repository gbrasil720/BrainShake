import { FileCode2 } from 'lucide-react'

export function HtmlObject({ item }) {
  return (
    <div className="widget-body html-card">
      <div className="html-label">
        <FileCode2 size={12} /> {item.name}
      </div>
      <iframe title={item.name} src={item.src} sandbox="allow-scripts" />
    </div>
  )
}
