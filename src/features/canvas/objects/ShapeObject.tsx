import type { CanvasItem } from '@/features/board/types'
const COLOR = 'var(--primary)'

// Outlines are authored on a 100x100 grid and stretched to the object's box, so a
// resized shape fills its bounds instead of shrinking to fit the shorter side.
const POLYGONS: Record<string, string> = {
  triangle: '50,8 92,90 8,90',
  diamond: '50,6 94,50 50,94 6,50',
  hexagon: '25,8 75,8 96,50 75,92 25,92 4,50',
  pentagon: '50,6 95,38 78,92 22,92 5,38',
  star: '50,5 61,37 95,37 68,57 78,91 50,71 22,91 32,57 5,37 39,37',
  arrow: '10,38 62,38 62,18 94,50 62,82 62,62 10,62'
}

function scalePolygon(points: string, sx: number, sy: number) {
  return points
    .split(' ')
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number)
      return `${x * sx},${y * sy}`
    })
    .join(' ')
}

export function ShapeObject({ item }: { item: CanvasItem }) {
  const fill = item.fill !== 'outline' ? item.fillColor || COLOR : 'none'
  const polygon = item.shape && Object.hasOwn(POLYGONS, item.shape) && POLYGONS[item.shape]
  const sx = item.w / 100
  const sy = item.h / 100
  // Keeps the stroke as thick as it was when the grid was scaled uniformly.
  const strokeWidth = 4 * Math.min(sx, sy)
  return (
    <svg
      className="shape-svg"
      viewBox={`0 0 ${item.w} ${item.h}`}
      aria-label={item.name || item.shape}
    >
      {item.shape === 'square' && (
        <rect
          x={8 * sx}
          y={8 * sy}
          width={84 * sx}
          height={84 * sy}
          rx={4 * Math.min(sx, sy)}
          fill={fill}
          stroke={COLOR}
          strokeWidth={strokeWidth}
        />
      )}
      {item.shape === 'circle' && (
        <ellipse
          cx={50 * sx}
          cy={50 * sy}
          rx={42 * sx}
          ry={42 * sy}
          fill={fill}
          stroke={COLOR}
          strokeWidth={strokeWidth}
        />
      )}
      {item.shape === 'line' && (
        <line
          x1={10 * sx}
          y1={50 * sy}
          x2={90 * sx}
          y2={50 * sy}
          stroke={COLOR}
          strokeWidth={strokeWidth}
        />
      )}
      {polygon && (
        <polygon
          points={scalePolygon(polygon, sx, sy)}
          fill={fill}
          stroke={COLOR}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
