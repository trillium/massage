import CachedTileMap from '@/components/CachedTileMap'
import clsx from 'clsx'

const serviceAreaBlurb =
  'Trillium is based out of Westchester, but happy to travel to the LA area in general. Very close locations include Playa Vista, Mar Vista, Santa Monica, Venice, El Segundo, Torrance, and Culver City.'
const title = "What's the service area for mobile massage therapy?"

export function ServiceAreaSection() {
  return (
    <section className="container flex w-full flex-col items-center gap-8">
      <ServiceArea title={title} text={serviceAreaBlurb} imageLeft />
    </section>
  )
}

type ServiceAreaProps = {
  title: string
  text: string
  imageLeft?: boolean
  imageRight?: boolean
}

function ServiceArea({ text, imageLeft, imageRight }: ServiceAreaProps) {
  let left = true
  if (imageLeft !== undefined) left = true
  if (imageRight !== undefined) left = false

  return (
    <div className="bg-hero grid w-full grid-flow-row auto-rows-min grid-cols-2 gap-4 overflow-hidden pb-10">
      <h2 className="col-span-2 text-left text-4xl font-bold tracking-tight sm:col-span-1 md:text-center md:text-5xl lg:text-6xl">
        {title || 'Title Missing'}
      </h2>

      <div
        className={clsx(
          'border-primary-500 relative col-span-2 row-span-3 flex min-h-96 w-full items-center justify-center overflow-hidden rounded-md border-2 sm:col-span-1',
          {
            'order-last sm:order-none': left,
            'order-last sm:order-first': !left,
          }
        )}
      >
        <CachedTileMap
          latitude={33.99}
          longitude={-118.4}
          zoom={10}
          className="absolute inset-0 border-0"
          style={{ width: '100%', height: '100%' }}
          showMarker={false}
        />
      </div>

      <p
        className={clsx(
          'text-md col-span-2 row-span-2 leading-relaxed font-light tracking-wider sm:col-span-1 sm:text-base md:text-left lg:text-xl'
        )}
      >
        {text || 'Missing text'}
      </p>
    </div>
  )
}
