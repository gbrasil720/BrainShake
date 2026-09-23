import type { BoardItem, CanvasItem } from '@/features/board/types'
import { isCanvasItem } from '@/features/board/types'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function PresentationMode({ items, onClose }: { items: BoardItem[]; onClose: () => void }) {
  const slides = items.filter((item): item is CanvasItem => isCanvasItem(item) && !!item.slide)
  const [index, setIndex] = useState(0)
  const current = slides[index]

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight' || event.key === ' ')
        setIndex((value) => Math.min(value + 1, slides.length - 1))
      if (event.key === 'ArrowLeft') setIndex((value) => Math.max(value - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, slides.length])

  return (
    <div className="presentation-backdrop">
      <div
        className="presentation-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Presentation mode"
      >
        <header className="presentation-heading">
          <span>
            Presentation · {slides.length ? `${index + 1} / ${slides.length}` : 'No slides'}
          </span>
          <button
            className="icon-button"
            title="Close presentation"
            aria-label="Close presentation"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </header>
        {current ? (
          <PresentationSlide item={current} />
        ) : (
          <p className="presentation-empty">
            Select an item and use the presentation button in the dock to add a slide.
          </p>
        )}
        <footer className="presentation-actions">
          <button
            className="icon-button"
            disabled={index === 0}
            title="Previous slide"
            aria-label="Previous slide"
            onClick={() => setIndex((value) => Math.max(value - 1, 0))}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="icon-button"
            disabled={!current || index === slides.length - 1}
            title="Next slide"
            aria-label="Next slide"
            onClick={() => setIndex((value) => Math.min(value + 1, slides.length - 1))}
          >
            <ChevronRight size={20} />
          </button>
        </footer>
      </div>
    </div>
  )
}

function PresentationSlide({ item }: { item: CanvasItem }) {
  return (
    <article className={`presentation-slide presentation-${item.type}`}>
      <h1>{item.title || item.name || item.type}</h1>
      <p>{item.text || 'This item is part of the presentation.'}</p>
    </article>
  )
}
