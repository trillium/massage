import siteMetadata from '@/data/siteMetadata'
import Image from 'next/image'
import Link from 'next/link'
import { GradientText } from '@/components/ui/GradientText'

const { avatar } = siteMetadata

export default function AboutSection() {
  return (
    <section>
      <div className="container grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative h-[400px] w-full md:h-[500px]">
          <Image
            src={avatar}
            alt="About our massage therapist (placeholder)"
            fill
            className="border-primary-500 rounded-lg border-2 object-cover object-[center_25%] shadow-lg"
            priority
          />
        </div>
        <div className="flex h-full flex-col justify-center space-y-4 text-left">
          <h2 className="text-left text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            About <GradientText classes="whitespace-nowrap">Trillium Massage</GradientText>
          </h2>
          <p className="mt-4 w-full text-left text-lg text-gray-600 md:mx-0 dark:text-gray-300">
            Trillium is a massage therapist with 10 years of experience. Working in the LA Metro
            Area, Trillium found success in specializing in In-Home mobile massage therapy, working
            solo and through platforms like Soothe and Zeel since 2016.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Combining relaxation and pain relief techniques, Trillium provides you with effective
            massage therapy from the comfort of your own home. With more than 3,000 in-home massage
            therapy sessions, Trillium has maintained a{' '}
            <Link
              className="text-primary-500 dark:text-primary-400 font-bold underline-offset-0 transition-transform duration-300 hover:scale-105 hover:underline"
              href={'/reviews'}
            >
              4.9-star rating
            </Link>
            , reflecting the quality and care he puts into his work.
          </p>
        </div>
      </div>
    </section>
  )
}
