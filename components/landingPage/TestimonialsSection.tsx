'use client'

import { Star } from '@/components/ReviewCard/Stars'
import type { ReviewType } from '@/lib/types'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight, FaAirbnb } from 'react-icons/fa'
import Logo from '../Logo'

const AIRBNB_REVIEWS_URL = 'https://www.airbnb.com/services/6527842?modal=reviews'

function SourceIcon({ source }: { source: string }) {
  if (source.toLowerCase().includes('airbnb')) {
    return (
      <Link
        href={AIRBNB_REVIEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="focus:ring-primary-500 flex items-center justify-center rounded-full focus:ring-2 focus:outline-none"
      >
        <FaAirbnb size={40} color="#FF5A5F" />
      </Link>
    )
  }
  if (source.toLowerCase().includes('soothe')) {
    return (
      <Image
        src="/soothe-icon.webp"
        alt="Soothe"
        width={40}
        height={40}
        style={{
          clipPath: 'circle(45% at center)',
        }}
      />
    )
  }
  if (source.toLowerCase().includes('trillium')) {
    return <Logo classes="text-primary-500 w-8 h-8 xs:w-10 xs:h-10" />
  }

  return null
}

export default function TestimonialsSection({
  text,
  reviews,
}: {
  text?: string
  reviews: ReviewType[]
}) {
  return (
    <section>
      <div className="w-full">
        <h2 className="xs:mb-2 mb-0 text-center text-3xl font-bold sm:mb-4 md:text-4xl dark:text-white">
          {text || 'What Clients Are Saying'}
        </h2>
        <TestimonialsCarousel reviews={reviews} />
        <div className="mt-4 text-center">
          <Link
            href="/reviews"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium underline underline-offset-2"
          >
            Read all reviews
          </Link>
        </div>
      </div>
    </section>
  )
}

export function TestimonialsCarousel({ reviews }: { reviews: ReviewType[] }) {
  const [current, setCurrent] = useState(0)
  const [pauseUntil, setPauseUntil] = useState(0)
  const total = reviews.length
  const leftButtonRef = React.useRef<HTMLButtonElement>(null)
  const rightButtonRef = React.useRef<HTMLButtonElement>(null)

  const pauseAndSetCurrent = useCallback((idx: number | ((prev: number) => number)) => {
    setPauseUntil(Date.now() + 15000)
    setCurrent(idx)
  }, [])

  const goLeft = useCallback(() => {
    return pauseAndSetCurrent((prev) => (prev - 1 + total) % total)
  }, [pauseAndSetCurrent, total])
  const goRight = useCallback(() => {
    return pauseAndSetCurrent((prev) => (prev + 1) % total)
  }, [pauseAndSetCurrent, total])

  useEffect(() => {
    const tick = () => {
      if (Date.now() < pauseUntil) return
      setCurrent((prev) => (prev + 1) % total)
    }
    const interval = setInterval(tick, 5000)
    return () => clearInterval(interval)
  }, [total, pauseUntil])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isLeftFocused = activeEl === leftButtonRef.current
      const isRightFocused = activeEl === rightButtonRef.current

      const reviewBodyEl = document.getElementById('review-body')
      const isReviewBodyFocusedAlt = activeEl === reviewBodyEl

      if (isLeftFocused || isRightFocused || isReviewBodyFocusedAlt) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          goLeft()
          if (isRightFocused || isReviewBodyFocusedAlt) {
            leftButtonRef.current?.focus()
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          goRight()
          if (isLeftFocused || isReviewBodyFocusedAlt) {
            rightButtonRef.current?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [goLeft, goRight])

  if (total === 0) return null

  const r = reviews[current]

  return (
    <div className="relative mx-auto flex flex-col items-center py-4">
      <div className="flex w-full items-center justify-between">
        {/* Review body: first in DOM, visually in the center */}
        <div
          tabIndex={0} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
          id="review-body"
          aria-label="Review content - use arrow keys to navigate"
          className="focus:ring-primary-500 relative order-2 flex min-h-80 w-full flex-1 flex-col items-center justify-between rounded-lg bg-gray-50 p-6 text-center shadow transition-all duration-300 focus:ring-2 focus:outline-none dark:bg-gray-800"
        >
          <div className="text-primary-400 mb-4 flex items-center gap-1">
            {Array.from({ length: r.rating }, (_, i) => (
              <Star key={i} size={24} />
            ))}
            {Array.from({ length: 5 - r.rating }, (_, i) => (
              <Star key={i + r.rating} size={24} fillClasses="opacity-30" />
            ))}
          </div>
          {r.comment && (
            <p className="mb-2 text-sm text-gray-700 italic sm:text-base md:text-lg xl:text-2xl dark:text-gray-200">
              "{r.spellcheck || r.comment}"
            </p>
          )}
          <div className="flex w-full items-end">
            <div className="flex w-full flex-col items-start">
              <span className="text-primary-700 dark:text-primary-300 block text-sm font-semibold sm:text-base md:text-lg xl:text-2xl">
                {r.name}
              </span>
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <SourceIcon source={r.source} />
          </div>
        </div>
        {/* Left button: visually first */}
        <DirectionButton
          ref={leftButtonRef}
          icon={FaChevronLeft}
          onClick={goLeft}
          ariaLabel="Previous review"
          placementClasses="mr-2 order-1"
        />
        {/* Right button: visually last */}
        <DirectionButton
          ref={rightButtonRef}
          icon={FaChevronRight}
          onClick={goRight}
          ariaLabel="Next review"
          placementClasses="ml-2 order-3"
        />
      </div>
      <div className="focus-within:ring-primary-500 mt-2 flex justify-center gap-2 rounded p-2 focus-within:ring-2">
        {reviews.map((_, idx) => (
          <React.Fragment key={idx}>
            <input
              type="radio"
              id={`review-dot-${idx}`}
              name="review-dot"
              checked={current === idx}
              onChange={() => pauseAndSetCurrent(idx)}
              className="sr-only"
              aria-label={`Go to review ${idx + 1}`}
            />
            <label
              htmlFor={`review-dot-${idx}`}
              className={clsx('h-2 w-2 cursor-pointer rounded-full transition-all duration-300', {
                'bg-primary-600 ring-primary-400 ring-2': idx === current,
                'bg-gray-300 dark:bg-gray-600': idx !== current,
              })}
            >
              <span className="sr-only">Go to review {idx + 1}</span>
            </label>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function DirectionButton({
  onClick,
  icon,
  ariaLabel,
  placementClasses,
  ref,
}: {
  onClick: () => void
  icon: React.ComponentType
  ariaLabel: string
  placementClasses: string
  ref?: React.RefObject<HTMLButtonElement | null>
}) {
  const IconComponent = icon
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={clsx(
        'focus:ring-primary-500 mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 p-2 text-gray-600 transition-all duration-300 hover:bg-gray-300 focus:ring-2 focus:outline-none active:bg-gray-400 active:ring-2 active:ring-yellow-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
        placementClasses
      )}
    >
      <span aria-hidden="true">
        <IconComponent />
      </span>
    </button>
  )
}
