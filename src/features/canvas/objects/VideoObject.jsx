export function VideoObject({ item }) {
  return (
    <div className="widget-body video-card">
      <video src={item.src} controls />
    </div>
  )
}
