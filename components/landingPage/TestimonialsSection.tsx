'use client'

import { Star } from '@/components/ReviewCard/Stars'
import type { ReviewType } from '@/lib/types'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight, FaAirbnb } from 'react-icons/fa'
import Logo from '../Logo'
import landing from '@/data/landing.json'
import { H2 } from '@/components/ui/heading'
import { TextSm, TextSmSemibold } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { PeerRadio } from '@/components/ui/peer-radio'

const AIRBNB_REVIEWS_URL = 'https://www.airbnb.com/services/6527842?modal=reviews'
const {
  defaultHeading,
  previousReviewAriaLabel,
  nextReviewAriaLabel,
  reviewQuotePrefix,
  reviewQuoteSuffix,
  goToReviewLabel,
} = landing.testimonials

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
      <Box className="w-full">
        <H2 className="xs:mb-2 mb-0 text-center sm:mb-4 md:text-4xl dark:text-white">
          {text || defaultHeading}
        </H2>
        <TestimonialsCarousel reviews={reviews} />
      </Box>
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
    <Stack className="relative mx-auto py-4" direction="col" align="center">
      <Stack className="w-full" direction="row" align="center" justify="between">
        {/* Review body: first in DOM, visually in the center */}
        <section
          id="review-body"
          aria-label="Review content - use arrow keys to navigate"
          className="focus:ring-primary-500 relative order-2 flex h-80 w-full flex-1 flex-col items-start justify-between rounded-lg bg-surface-100 p-6 text-left shadow transition-all duration-300 focus:ring-2 focus:outline-none dark:bg-surface-800"
        >
          <Stack
            className="text-primary-400 w-full"
            direction="row"
            justify="center"
            align="center"
            gap={1}
          >
            {Array.from({ length: r.rating }, (_, i) => (
              <Star key={i} size={24} />
            ))}
            {Array.from({ length: 5 - r.rating }, (_, i) => (
              <Star key={i + r.rating} size={24} fillClasses="opacity-30" />
            ))}
          </Stack>
          <Stack
            className="min-h-0 w-full flex-1 my-4 visible-scrollbar overflow-y-auto"
            direction="row"
            align="center"
          >
            {r.comment && (
              <TextSm className="sm:text-base md:text-lg xl:text-2xl">
                {reviewQuotePrefix}
                {r.spellcheck || r.comment}
                {reviewQuoteSuffix}
              </TextSm>
            )}
          </Stack>
          <Stack className="w-full" direction="row" align="end">
            <Stack className="w-full" direction="col" align="start">
              <TextSmSemibold className="block sm:text-base md:text-lg xl:text-2xl">
                {r.name}
              </TextSmSemibold>
            </Stack>
          </Stack>
          <Box className="absolute top-4 left-4">
            <SourceIcon source={r.source} />
          </Box>
        </section>
        {/* Left button: visually first */}
        <DirectionButton
          ref={leftButtonRef}
          icon={FaChevronLeft}
          onClick={goLeft}
          ariaLabel={previousReviewAriaLabel}
          placementClasses="mr-2 order-1"
        />
        {/* Right button: visually last */}
        <DirectionButton
          ref={rightButtonRef}
          icon={FaChevronRight}
          onClick={goRight}
          ariaLabel={nextReviewAriaLabel}
          placementClasses="ml-2 order-3"
        />
      </Stack>
      <Stack
        className="focus-within:ring-primary-500 mt-2 rounded p-2 focus-within:ring-2"
        direction="row"
        justify="center"
        gap={2}
      >
        {reviews.map((_, idx) => (
          <React.Fragment key={idx}>
            <PeerRadio
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
                'bg-primary-600 ring-2 ring-primary-400': idx === current,
                'bg-surface-300 dark:bg-surface-600': idx !== current,
              })}
            >
              <span className="sr-only">
                {goToReviewLabel} {idx + 1}
              </span>
            </label>
          </React.Fragment>
        ))}
      </Stack>
    </Stack>
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
    <Button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={clsx(
        'focus:ring-primary-500 mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-200 p-2 text-accent-600 transition-all duration-300 hover:bg-surface-300 focus:ring-2 focus:outline-none active:bg-surface-400 active:ring-2 active:ring-yellow-500 dark:bg-surface-700 dark:text-accent-200 dark:hover:bg-surface-600',
        placementClasses
      )}
    >
      <span aria-hidden="true">
        <IconComponent />
      </span>
    </Button>
  )
}
