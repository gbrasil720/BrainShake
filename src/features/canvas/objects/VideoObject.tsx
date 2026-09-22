import type { CanvasItem } from '@/features/board/types'
export function VideoObject({ item }: { item: CanvasItem }) {
  return (
    <div className="widget-body video-card">
      <video src={item.src} controls />
    </div>
  )
}
