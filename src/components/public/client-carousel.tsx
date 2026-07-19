'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { submitReview } from '@/actions/public-review'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  url: string
  mediaType: string
}

interface Category {
  id: string
  name: string
  media: MediaItem[]
}

interface ClientCarouselProps {
  slug: string
  clientName: string
  businessName: string
  pageTitle: string
  eventDate: Date | null
  message: string | null
  media: MediaItem[]
  categories: Category[]
}

export function ClientCarousel({
  slug,
  clientName,
  businessName,
  pageTitle,
  eventDate,
  media,
  categories,
}: ClientCarouselProps) {
  const hasCategories = categories.length > 0
  const totalSlides = 1 + media.length + (hasCategories ? 1 : 0) + 1
  const categorySlideIndex = 1 + media.length
  const reviewSlideIndex = totalSlides - 1

  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)

  function goTo(index: number) {
    if (index < 0 || index >= totalSlides) return
    setCurrent(index)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      goTo(current + (diff > 0 ? 1 : -1))
    }
    touchStartX.current = null
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
        {/* Slide 0: Intro */}
        <Slide active={current === 0} backgroundUrl={null}>
          <div className="flex flex-col h-full" style={{ background: '#1a0508' }}>

            {/* Top bar */}
            <div className="relative flex items-center justify-start px-6 py-5 flex-shrink-0">
              <p
                className="text-[10px] uppercase tracking-[0.15em] text-white/30"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Memoir
              </p>
              <button
                onClick={() => goTo(1)}
                className="absolute right-6 text-[10px] font-medium uppercase tracking-[0.1em] text-white/70 px-4 py-1.5 rounded-full transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.25)' }}
              >
                Next
              </button>
            </div>

            {/* Headline */}
            <div className="px-6 pb-5 flex-shrink-0 text-center">
              <h1
                className="text-2xl text-white leading-snug"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}
              >
                Thank you for trusting
                <br />
                us with your event
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#C6A46C] mt-3">
                {businessName}
              </p>
            </div>

            {/* Photo card */}
            <div className="flex-1 px-6 pb-16 flex flex-col min-h-0">
              <div
                className="w-[85vw] h-[90vh] rounded-2xl overflow-hidden min-h-0 mx-auto"
                style={{
                  background: media[0]?.url
                    ? `url(${media[0].url}) center/cover`
                    : 'linear-gradient(160deg, #8a6a4a 0%, #5c4632 50%, #2e2418 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />

              <div className="text-center pt-4 flex-shrink-0">
                <h2 className="text-lg font-medium text-white tracking-wide uppercase mb-1">
                  {pageTitle}
                </h2>
                {eventDate && (
                  <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">
                    {new Date(eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 mt-4 animate-pulse">
                  Swipe or tap Next to view gallery →
                </p>
              </div>
            </div>

          </div>
        </Slide>

        {/* Photo stack slide */}
        <Slide active={current >= 1 && current <= media.length} backgroundUrl={null}>
          {current >= 1 && current <= media.length && (
            <PhotoStack
              media={media}
              activeIndex={current - 1}
              onGoToPhoto={(i) => goTo(i + 1)}
            />
          )}
        </Slide>

        {/* Category slide */}
        {hasCategories && (
          <Slide active={current === categorySlideIndex} backgroundUrl={null}>
            <CategoryGallerySlide categories={categories} />
          </Slide>
        )}

        {/* Review slide */}
        <Slide active={current === reviewSlideIndex} backgroundUrl={null} dark>
          <ReviewForm slug={slug} clientName={clientName} />
        </Slide>

        {/* Navigation arrows */}
        {current > 0 && (
          <button
            onClick={() => {
              if (current === reviewSlideIndex) goTo(hasCategories ? categorySlideIndex : 1)
              else if (current === categorySlideIndex) goTo(1)
              else goTo(0)
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A46C]/50"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
            aria-label="Previous section"
          >
            ‹
          </button>
        )}
        {current < totalSlides - 1 && (
          <button
            onClick={() => {
              if (current === 0) goTo(1)
              else if (current >= 1 && current <= media.length) goTo(hasCategories ? categorySlideIndex : reviewSlideIndex)
              else if (current === categorySlideIndex) goTo(reviewSlideIndex)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A46C]/50"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
            aria-label="Next section"
          >
            ›
          </button>
        )}

        {/* Dot indicators */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-full"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        >
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all"
              style={{
                width: current === i ? '20px' : '6px',
                height: '6px',
                background: current === i ? '#C6A46C' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
    </div>
  )
}

function Slide({
  active,
  backgroundUrl,
  dark,
  children,
}: {
  active: boolean
  backgroundUrl: string | null
  dark?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="absolute inset-0 transition-opacity duration-500"
      style={{
        opacity: active ? 1 : 0,
        pointerEvents: active ? 'auto' : 'none',
        background: backgroundUrl
          ? `url(${backgroundUrl}) center/cover`
          : dark
          ? '#0d0306'
          : 'linear-gradient(135deg, #1a0508, #2e0d18)',
      }}
    >
      {backgroundUrl && (
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
      )}
      <div className="relative h-full z-10">{children}</div>
    </div>
  )
}

function PhotoStack({
  media,
  activeIndex,
  onGoToPhoto,
}: {
  media: MediaItem[]
  activeIndex: number
  onGoToPhoto: (index: number) => void
}) {
  const prevItem = activeIndex > 0 ? media[activeIndex - 1] : null
  const nextItem = activeIndex < media.length - 1 ? media[activeIndex + 1] : null
  const current = media[activeIndex]

  // Auto-advance the photo stack, looping back to start
  useEffect(() => {
    if (media.length <= 1) return
    const timer = setTimeout(() => {
      const nextIndex = activeIndex < media.length - 1 ? activeIndex + 1 : 0
      onGoToPhoto(nextIndex)
    }, 4000)
    return () => clearTimeout(timer)
  }, [activeIndex, media.length, onGoToPhoto])

  function goPrev() {
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : media.length - 1
    onGoToPhoto(prevIndex)
  }

  function goNext() {
    const nextIndex = activeIndex < media.length - 1 ? activeIndex + 1 : 0
    onGoToPhoto(nextIndex)
  }

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-6 py-12">
      <div className="relative flex-1 flex items-center justify-center w-full">
        {prevItem && (
          <div
            onClick={goPrev}
            className="absolute rounded-[20px] overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-300"
            style={{
              width: 'min(60vw, 260px)',
              height: 'min(70vh, 380px)',
              transform: 'rotate(-8deg) translateX(-46%)',
              background: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${prevItem.url}) center/cover`,
              filter: 'blur(1px)',
              zIndex: 1,
            }}
          >
            <span className="text-2xl" style={{ color: 'rgba(255,255,255,0.6)', transform: 'rotate(8deg)' }}>
              ‹
            </span>
          </div>
        )}

        {nextItem && (
          <div
            onClick={goNext}
            className="absolute rounded-[20px] overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-300"
            style={{
              width: 'min(60vw, 260px)',
              height: 'min(70vh, 380px)',
              transform: 'rotate(6deg) translateX(46%)',
              background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${nextItem.url}) center/cover`,
              filter: 'blur(1px)',
              zIndex: 2,
            }}
          >
            <span className="text-2xl" style={{ color: 'rgba(255,255,255,0.6)', transform: 'rotate(-6deg)' }}>
              ›
            </span>
          </div>
        )}

        <div
          key={current.id}
          className="relative rounded-[22px] overflow-hidden transition-all duration-300"
          style={{
            width: 'min(70vw, 320px)',
            height: 'min(78vh, 460px)',
            background: current.mediaType === 'video' ? '#000' : `url(${current.url}) center/cover`,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            zIndex: 10,
          }}
        >
          {current.mediaType === 'video' && (
            <video src={current.url} className="w-full h-full object-cover" controls />
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6) 100%)' }}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <p className="text-[11px] font-medium tracking-[0.1em] text-white/60">
              {activeIndex + 1} / {media.length}
            </p>
          </div>
        </div>
      </div>

      {/* Prev/Next controls for the photo stack itself */}
      <div className="flex items-center gap-3 mt-6 flex-shrink-0">
        <button
          onClick={goPrev}
          className={cn(buttonVariants({ variant: 'premium-ghost', size: 'sm' }), 'rounded-full')}
        >
          ‹ Prev
        </button>
        <button
          onClick={goNext}
          className={cn(buttonVariants({ variant: 'premium', size: 'sm' }), 'rounded-full')}
        >
          Next ›
        </button>
      </div>
      <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 mt-4 animate-pulse">
        Swipe or tap arrow to continue →
      </p>
    </div>
  )
}

function ReviewForm({ slug, clientName }: { slug: string; clientName: string }) {
  const [name, setName] = useState(clientName)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await submitReview(slug, { reviewerName: name, rating, review })
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error ?? 'Failed to submit review')
      }
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <p className="text-2xl text-[#C6A46C] mb-2">✓</p>
        <h2 className="text-2xl font-bold text-white mb-2">Thank you!</h2>
        <p className="text-sm text-white/50">Your review has been submitted.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <h2 className="text-2xl font-bold text-white mb-2">How was your experience?</h2>
      <p className="text-sm text-white/40 mb-6">Leave a review to let us know</p>

      <div className="w-full max-w-sm space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none placeholder:text-white/30"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-2xl transition-colors"
              style={{ color: star <= rating ? '#C6A46C' : 'rgba(255,255,255,0.2)' }}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none placeholder:text-white/30"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !name.trim() || !review.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(135deg, #C6A46C, #D8BA86)', color: '#14060c' }}
        >
          {isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}

function CategoryGallerySlide({ categories }: { categories: Category[] }) {
  const [openCategory, setOpenCategory] = useState<Category | null>(null)

  if (openCategory) {
    return (
      <div className="flex flex-col h-full" style={{ background: '#0d0306' }}>
        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0">
          <button
            onClick={() => setOpenCategory(null)}
            className={cn(buttonVariants({ variant: 'premium-ghost', size: 'sm' }))}
          >
            ← Back
          </button>
          <p className="text-sm font-medium text-white">{openCategory.name}</p>
          <p className="text-xs text-white/30 ml-auto">{openCategory.media.length} photos</p>
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 pb-16"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {openCategory.media.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-xl overflow-hidden"
                style={{ background: '#1a0508' }}
              >
                {item.mediaType === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#1a0508' }}>
      <div className="relative flex items-center justify-center px-6 py-5 flex-shrink-0">
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/30" style={{ fontFamily: 'Georgia, serif' }}>
          Memoir
        </p>
      </div>

      <div className="px-6 pb-4 flex-shrink-0 text-center">
        <h2
          className="text-xl text-white leading-snug"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}
        >
          Your gallery
        </h2>
        <p className="text-[10px] text-white/35 uppercase tracking-[0.1em] mt-1">
          Tap a category to view all photos
        </p>
      </div>

      <div
        className="flex-1 px-4 pb-16 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setOpenCategory(cat)}
              className="relative rounded-2xl overflow-hidden text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                aspectRatio: '3/4',
                background: cat.media[0]?.url
                  ? `url(${cat.media[0].url}) center/cover`
                  : 'linear-gradient(135deg, #3D1A24, #1a0508)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)' }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-medium text-white leading-tight">{cat.name}</p>
                <p className="text-[10px] text-white/50 mt-0.5">
                  {cat.media.length} photo{cat.media.length !== 1 ? 's' : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}