export function strokePath(points) {
  return points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
}

export function StrokeObject({ item }) {
  return (
    <svg className="stroke" viewBox={`0 0 ${item.w} ${item.h}`}>
      <path style={{ strokeWidth: item.strokeWidth || 4 }} d={strokePath(item.points)} />
    </svg>
  )
}
