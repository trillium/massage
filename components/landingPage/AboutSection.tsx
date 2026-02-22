import Image from 'next/image'
import Link from '@/components/Link'
import { GradientText } from '@/components/ui/GradientText'
import { siteConfig } from '@/lib/siteConfig'

const { name } = siteConfig.business
const { avatar } = siteConfig.branding
const { about } = siteConfig.content

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
            About <GradientText classes="whitespace-nowrap">{name}</GradientText>
          </h2>
          <p className="mt-4 w-full text-left text-lg text-gray-600 md:mx-0 dark:text-gray-300">
            {about.bio}
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {about.focus} {about.stats}{' '}
            <Link
              className="text-primary-500 dark:text-primary-400 font-bold underline-offset-0 transition-transform duration-300 hover:scale-105 hover:underline"
              href={'/reviews'}
            >
              {about.rating}
            </Link>
            {about.statsClose}
          </p>
        </div>
      </div>
    </section>
  )
}
