import { useEffect, useRef } from 'react'
import type { CanvasItem } from '@/features/board/types'
export function VideoObject({ item }: { item: CanvasItem }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || typeof IntersectionObserver === 'undefined') return

    let resumeWhenVisible = false
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return
      if (!entry.isIntersecting) {
        resumeWhenVisible = !video.paused && !video.ended
        video.pause()
      } else if (resumeWhenVisible) {
        resumeWhenVisible = false
        void video.play().catch(() => {})
      }
    })

    observer.observe(video)
    return () => observer.disconnect()
  }, [item.src])

  return (
    <div className="widget-body video-card">
      <video ref={videoRef} src={item.src} controls preload="metadata" playsInline />
    </div>
  )
}
