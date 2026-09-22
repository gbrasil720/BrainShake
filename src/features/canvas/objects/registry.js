import { HtmlObject } from './HtmlObject.jsx'
import { ImageObject } from './ImageObject.jsx'
import { ShapeObject } from './ShapeObject.jsx'
import { StickyObject } from './StickyObject.jsx'
import { StrokeObject } from './StrokeObject.jsx'
import { TextObject } from './TextObject.jsx'
import { VideoObject } from './VideoObject.jsx'

// type -> how the object is rendered on the canvas.
// framed: wrapped in WidgetFrame (titlebar + close). className: extra class on the unframed root.
// defaultSize: size used when the object is created without an explicit w/h.
export const objectRegistry = {
  sticky: { Component: StickyObject, framed: true, defaultSize: { w: 250, h: 180 } },
  text: { Component: TextObject, framed: true, defaultSize: { w: 280, h: 145 } },
  image: { Component: ImageObject, framed: true, defaultSize: { w: 280, h: 200 } },
  video: { Component: VideoObject, framed: true, defaultSize: { w: 320, h: 220 } },
  html: { Component: HtmlObject, framed: true, defaultSize: { w: 350, h: 240 } },
  shape: {
    Component: ShapeObject,
    framed: false,
    className: 'shape-object',
    defaultSize: { w: 250, h: 180 }
  },
  stroke: { Component: StrokeObject, framed: false, className: 'stroke-object' }
}

// Unknown types (e.g. from an imported file) render as an empty frame.
const fallback = { Component: null, framed: true }

export function getObjectType(type) {
  return objectRegistry[type] || fallback
}

export function defaultSize(type) {
  return getObjectType(type).defaultSize || { w: 250, h: 180 }
}
