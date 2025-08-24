import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { FaCar, FaRegClock } from 'react-icons/fa'
import { FiMapPin } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'
import { GradientText } from '@/components/ui/GradientText'

export default function HeroSection() {
  return (
    <section className="flex w-full flex-col items-center gap-8">
      <div className="container grid w-full grid-cols-1 items-stretch gap-8 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr]">
        <TextContent positionClasses="md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-2" />

        <ImageContent positionClasses="md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3" />

        <ButtonContent positionClasses="md:col-start-1 md:col-end-2 md:row-start-2 md:row-end-3 " />
      </div>
    </section>
  )
}

function TextContent({ positionClasses }: { positionClasses?: string }) {
  return (
    <div
      className={clsx(
        'flex h-full flex-col items-center space-y-4 text-center md:text-left',
        positionClasses
      )}
    >
      <div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Relax, Rejuvenate, <GradientText>Restore</GradientText>
        </h1>
        <h2 className="mx-auto mt-4 max-w-lg text-3xl font-semibold text-gray-600 md:mx-0 dark:text-gray-300">
          Let the spa come to you
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-xl text-gray-600 md:mx-0 dark:text-gray-300">
          Spa level massage therapy in your home, at your convenience.
        </p>
      </div>
    </div>
  )
}

function ImageContent({ positionClasses }: { positionClasses?: string }) {
  return (
    <div className={clsx('relative flex-1', positionClasses)}>
      <div className="border-primary-500 relative h-[400px] w-full min-w-96 overflow-hidden rounded-lg border-2 md:h-[500px]">
        {
          <Image
            src={'/static/images/foo/A_good_03.webp'}
            alt="Massage therapy session"
            fill
            className="object-cover"
            priority
          />
        }
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent"></div>
      </div>
      <div className="bg-primary-100 absolute -bottom-6 -left-6 flex h-24 w-24 items-center justify-center rounded-full">
        <HiSparkles className="text-primary-600 h-10 w-10" />
      </div>
    </div>
  )
}

function ButtonContent({ positionClasses }: { positionClasses?: string }) {
  return (
    <div
      className={clsx(
        'flex h-full flex-col justify-end space-y-4 text-center md:text-left',
        positionClasses
      )}
    >
      <div className="flex flex-col gap-y-4">
        <div className="sm:grid-span-1 col-span-2 grid grid-cols-1 gap-2 sm:col-span-1 sm:grid-cols-2">
          <Link
            href="/book"
            // className="text-md border-primary-500 bg-primary-500 w-full rounded-md border-2 px-2 py-3 text-center font-semibold text-white"
            className="bg-primary-600 hover:bg-primary-700 border-primary-500 mt-auto inline-block w-full rounded border-2 px-4 py-2 text-center font-semibold text-white transition-colors"
          >
            Book a session
          </Link>

          <Link
            href="/services"
            // className="text-md border-primary-500 text-primary-500 dark:text-primary-600 w-full rounded-md border-2 bg-white px-2 py-3 text-center font-semibold"
            className="text-md border-primary-500 text-primary-600 mt-auto inline-block w-full rounded border-2 bg-white px-4 py-2 text-center font-semibold transition-colors hover:bg-gray-200"
          >
            Explore Services
          </Link>
        </div>
        <div className="xs:flex-col flex flex-col flex-wrap justify-around gap-2 gap-y-6 sm:flex-row md:flex-col xl:flex-row">
          <div className="flex items-center gap-2">
            <FaRegClock className="h-5 w-5 text-teal-600" />
            <span className="text-sm whitespace-nowrap">Open 7 days</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className="h-5 w-5 text-teal-600" />
            <span className="text-sm whitespace-nowrap">Westchester Based</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCar className="h-5 w-5 text-teal-600" />
            <span className="text-sm whitespace-nowrap">Serving the LA Metro Area</span>
          </div>
        </div>
      </div>
    </div>
  )
}
