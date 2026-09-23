export type Point = { x: number; y: number }

export type CanvasItem = {
  id: string
  type: string
  x: number
  y: number
  w: number
  h: number
  color?: string
  title?: string
  text?: string
  name?: string
  src?: string
  mediaType?: string
  mediaOmitted?: boolean
  locked?: boolean
  slide?: boolean
  slideOrder?: number
  editing?: boolean
  fill?: string
  fillColor?: string
  shape?: string
  strokeWidth?: number
  points?: Point[]
}

export type ConnectorItem = { id: string; type: 'connector'; from: string; to: string }
export type BoardItem = CanvasItem | ConnectorItem
export type Board = { id: string; name: string; objects: BoardItem[] }
export type BoardPatch = Partial<CanvasItem & ConnectorItem>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export function isBoardItem(value: unknown): value is BoardItem {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.type !== 'string')
    return false
  if (value.type === 'connector')
    return typeof value.from === 'string' && typeof value.to === 'string'
  return (
    ['x', 'y', 'w', 'h'].every((key) => typeof value[key] === 'number') &&
    ['color', 'title', 'text', 'name', 'src', 'mediaType', 'fill', 'fillColor', 'shape'].every(
      (key) => value[key] === undefined || typeof value[key] === 'string'
    ) &&
    ['locked', 'editing', 'mediaOmitted', 'slide'].every(
      (key) => value[key] === undefined || typeof value[key] === 'boolean'
    ) &&
    (value.slideOrder === undefined || typeof value.slideOrder === 'number') &&
    (value.strokeWidth === undefined || typeof value.strokeWidth === 'number') &&
    (value.points === undefined ||
      (Array.isArray(value.points) &&
        value.points.every(
          (point) => isRecord(point) && typeof point.x === 'number' && typeof point.y === 'number'
        )))
  )
}

export function isBoardData(
  value: unknown
): value is Pick<Board, 'name' | 'objects'> & { id?: string } {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    Array.isArray(value.objects) &&
    value.objects.every(isBoardItem) &&
    (value.id === undefined || typeof value.id === 'string')
  )
}

export function isBoard(value: unknown): value is Board {
  return isBoardData(value) && typeof value.id === 'string'
}

export function isCanvasItem(item: BoardItem): item is CanvasItem {
  return item.type !== 'connector' && 'x' in item && 'y' in item && 'w' in item && 'h' in item
}

export function isConnectorItem(item: BoardItem): item is ConnectorItem {
  return item.type === 'connector' && 'from' in item && 'to' in item
}
