import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
      if (event.key === 'ArrowRight' || event.key === ' ')
        setIndex((value) => Math.min(value + 1, slides.length - 1))
      if (event.key === 'ArrowLeft') setIndex((value) => Math.max(value - 1, 0))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [slides.length])

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="presentation-dialog"
        showCloseButton={false}
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const content = event.currentTarget as HTMLElement
          content.focus()
        }}
      >
        <header className="presentation-heading">
          <DialogTitle>
            Presentation · {slides.length ? `${index + 1} / ${slides.length}` : 'No slides'}
          </DialogTitle>
          <Button
            variant="ghost"
            className="icon-button"
            title="Close presentation"
            aria-label="Close presentation"
            onClick={onClose}
          >
            <X size={17} />
          </Button>
        </header>
        {current ? (
          <PresentationSlide item={current} />
        ) : (
          <p className="presentation-empty">
            Select an item and use the presentation button in the dock to add a slide.
          </p>
        )}
        <footer className="presentation-actions">
          <Button
            variant="ghost"
            className="icon-button"
            disabled={index === 0}
            title="Previous slide"
            aria-label="Previous slide"
            onClick={() => setIndex((value) => Math.max(value - 1, 0))}
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            className="icon-button"
            disabled={!current || index === slides.length - 1}
            title="Next slide"
            aria-label="Next slide"
            onClick={() => setIndex((value) => Math.min(value + 1, slides.length - 1))}
          >
            <ChevronRight size={20} />
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
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
