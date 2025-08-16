import MapTile from '@/components/MapTile'
import Link from 'next/link'
import clsx from 'clsx'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { geocodeLocation } from '@/lib/geocode'

type HeroProps = {
  title: string
  text: string
  img: string
  buttons?: boolean
  imageLeft?: boolean
  imageRight?: boolean
}

let EVENT_LOC_STRING
try {
  EVENT_LOC_STRING = process.env.GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID
  if (!EVENT_LOC_STRING) {
    throw new Error('GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID environment variable is not set')
  }
} catch (error) {
  console.error('Failed to get GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID:', error)
  throw error
}

export default async function Hero({
  title,
  text,
  img,
  buttons = true,
  imageLeft,
  imageRight,
}: HeroProps) {
  // Fetch event data and get location coordinates
  let latitude: number | undefined
  let longitude: number | undefined

  try {
    const event = await fetchSingleEvent(EVENT_LOC_STRING)
    if (event?.location) {
      const geocodeResult = await geocodeLocation(event.location)
      if (geocodeResult.success && geocodeResult.coordinates) {
        latitude = geocodeResult.coordinates.lat
        longitude = geocodeResult.coordinates.lng
      }
    }
  } catch (error) {
    console.error('Error fetching event location:', error)
  }
  let left = true
  if (imageLeft !== undefined) left = true
  if (imageRight !== undefined) left = false

  return (
    <div className="bg-hero grid w-full grid-flow-row auto-rows-min grid-cols-2 gap-4 overflow-hidden pb-10">
      <h1 className="text-primary-500 dark:text-primary-400 col-span-2 text-3xl font-bold tracking-tight sm:col-span-1 sm:text-4xl md:text-left md:text-5xl lg:text-5xl">
        {title || 'Missing title'}
      </h1>

      <div
        className={clsx(
          'relative col-span-2 row-span-3 flex min-h-96 w-full items-center justify-center overflow-hidden rounded-md object-cover sm:col-span-1',
          {
            'order-last sm:order-none': left,
            'order-last sm:order-first': !left,
          }
        )}
      >
        <MapTile
          longitude={longitude}
          latitude={latitude}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <p
        className={clsx(
          'text-md col-span-2 leading-relaxed font-light tracking-wider sm:col-span-1 sm:text-base md:text-left lg:text-xl',
          { 'row-span-2': !buttons }
        )}
      >
        {text || 'Missing text'}
      </p>

      {buttons && (
        <div className="sm:grid-span-1 col-span-2 grid grid-cols-1 gap-2 sm:col-span-1 sm:grid-cols-2">
          <div className="flex items-end justify-center">
            <Link
              href="/book"
              className="text-md border-primary-500 bg-primary-500 w-full rounded-md border-2 px-2 py-3 text-center font-semibold text-white"
            >
              Book a session
            </Link>
          </div>
          <div className="flex items-end justify-center">
            <Link
              href="/about"
              className="text-md border-primary-500 text-primary-500 dark:text-primary-600 w-full rounded-md border-2 bg-white px-2 py-3 text-center font-semibold"
            >
              Find out more
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
