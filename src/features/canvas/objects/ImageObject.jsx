export function ImageObject({ item }) {
  return (
    <div className="widget-body image-card">
      <img src={item.src} alt={item.name || 'Imported image'} />
    </div>
  )
}
