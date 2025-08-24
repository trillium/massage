import Image from '@/components/Image'
import clsx from 'clsx'

const mapData = '/static/images/foo/service-area.jpg'
const serviceAreaBlurb =
  'Trillium is based out of Westchester, but happy to travel to the LA area in general. Very close locations include Playa Vista, Mar Vista, Santa Monica, Venice, El Segundo, Torrance, and Culver City.'
const title = "What's the service area for mobile massage therapy?"

export function ServiceAreaSection() {
  return (
    <section className="container flex w-full flex-col items-center gap-8">
      <ServiceArea title={title} img={mapData} text={serviceAreaBlurb} imageLeft />
    </section>
  )
}

type ServiceAreaProps = {
  title: string
  text: string
  img: string
  imageLeft?: boolean
  imageRight?: boolean
}

function ServiceArea({ text, img, imageLeft, imageRight }: ServiceAreaProps) {
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
          'relative col-span-2 row-span-3 flex min-h-96 w-full items-center justify-center overflow-hidden rounded-md object-cover sm:col-span-1',
          {
            'order-last sm:order-none': left,
            'order-last sm:order-first': !left,
          }
        )}
      >
        <Image
          src={img}
          alt="Image of Trillium"
          fill
          className="border-primary-500 absolute rounded-md border-2 object-cover object-[50%_40%]"
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
