import type { CanvasItem } from '@/features/board/types'
export function ImageObject({ item }: { item: CanvasItem }) {
  return (
    <div className="widget-body image-card">
      <img src={item.src} alt={item.name || 'Imported image'} />
    </div>
  )
}
