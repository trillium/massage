import Image from '@/components/Image'
import Link from '@/components/Link'
import clsx from 'clsx'

type HeroProps = {
  title: string
  text: string
  img: string
  buttons?: boolean
  imageLeft?: boolean
  imageRight?: boolean
}

export default function Hero({
  title,
  text,
  img,
  buttons = true,
  imageLeft,
  imageRight,
}: HeroProps) {
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
        <Image
          src={img}
          alt="Image of Trillium"
          fill
          className="border-primary-500 absolute rounded-md border-2 object-cover object-[50%_40%]"
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
