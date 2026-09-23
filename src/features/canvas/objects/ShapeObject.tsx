import type { CanvasItem } from '@/features/board/types'
const COLOR = 'var(--primary)'

const POLYGONS: Record<string, string> = {
  triangle: '50,8 92,90 8,90',
  diamond: '50,6 94,50 50,94 6,50',
  hexagon: '25,8 75,8 96,50 75,92 25,92 4,50',
  pentagon: '50,6 95,38 78,92 22,92 5,38',
  star: '50,5 61,37 95,37 68,57 78,91 50,71 22,91 32,57 5,37 39,37',
  arrow: '10,38 62,38 62,18 94,50 62,82 62,62 10,62'
}

export function ShapeObject({ item }: { item: CanvasItem }) {
  const fill = item.fill !== 'outline' ? item.fillColor || COLOR : 'none'
  const polygon = item.shape && Object.hasOwn(POLYGONS, item.shape) && POLYGONS[item.shape]
  return (
    <svg className="shape-svg" viewBox="0 0 100 100" aria-label={item.name || item.shape}>
      {item.shape === 'square' && (
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="4"
          fill={fill}
          stroke={COLOR}
          strokeWidth="4"
        />
      )}
      {item.shape === 'circle' && (
        <circle cx="50" cy="50" r="42" fill={fill} stroke={COLOR} strokeWidth="4" />
      )}
      {item.shape === 'line' && (
        <line x1="10" y1="50" x2="90" y2="50" stroke={COLOR} strokeWidth="4" />
      )}
      {polygon && (
        <polygon
          points={polygon}
          fill={fill}
          stroke={COLOR}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
