import Image from '@/components/Image'
import Link from 'next/link'

export default function Hero({ title, text, img }) {
  return (
    <div className="bg-hero grid w-full grid-flow-row auto-rows-min grid-cols-2 gap-4 overflow-hidden pb-10">
      <h1 className="col-span-2 text-3xl font-bold tracking-tight text-primary-500 dark:text-primary-400 sm:col-span-1 sm:text-4xl md:text-left md:text-5xl lg:text-5xl">
        {title || 'Missing title'}
      </h1>

      <div className="relative order-last col-span-2 row-span-3 flex min-h-96 w-full items-center justify-center overflow-hidden rounded-md object-cover sm:order-none sm:col-span-1 ">
        <Image
          src={img}
          alt="Image of Trillium"
          fill
          className="absolute rounded-md border-2 border-primary-500 object-cover object-[50%_40%]"
        />
      </div>

      <p className="text-md col-span-2 font-light leading-relaxed tracking-wider sm:col-span-1 sm:text-base md:text-left lg:text-xl">
        {text || 'Missing text'}
      </p>
      <div className="sm:grid-span-1 col-span-2 grid grid-cols-1 gap-2 sm:col-span-1 sm:grid-cols-2">
        <div className="flex items-end justify-center">
          <Link
            href="/book"
            className="text-md w-full rounded-md border-2 border-primary-500 bg-primary-500 px-2 py-3 text-center font-semibold text-white"
          >
            Book a session
          </Link>
        </div>
        <div className="flex items-end justify-center">
          <Link
            href="/about"
            className="text-md w-full rounded-md border-2 border-primary-500 bg-white px-2 py-3 text-center font-semibold text-primary-500 dark:text-primary-600"
          >
            Find out more
          </Link>
        </div>
      </div>
    </div>
  )
}
