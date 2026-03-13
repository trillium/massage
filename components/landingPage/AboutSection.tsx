import Image from 'next/image'
import Link from '@/components/Link'
import { GradientText } from '@/components/ui/GradientText'
import type { ReactNode } from 'react'

interface AboutSectionProps {
  imageSrc: string
  imageAlt: string
  title: string
  titleGradient: string
  paragraphs: Array<string | ReactNode>
  imagePosition?: string
}

export function AboutLayout({
  imageSrc,
  imageAlt,
  title,
  titleGradient,
  paragraphs,
  imagePosition = 'object-[center_25%]',
}: AboutSectionProps) {
  return (
    <section>
      <div className="container grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="relative h-[400px] w-full md:h-[500px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className={`border-primary-500 rounded-lg border-2 object-cover ${imagePosition} shadow-lg`}
            priority
          />
        </div>
        <div className="flex h-full flex-col justify-center space-y-4 text-left">
          <h2 className="text-left text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {title} <GradientText classes="whitespace-nowrap">{titleGradient}</GradientText>
          </h2>
          {paragraphs.map((paragraph, idx) => (
            <p
              key={idx}
              className={`text-lg text-gray-600 dark:text-gray-300 ${idx === 0 ? 'mt-4' : ''}`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

import { siteConfig } from '@/lib/siteConfig'

const { avatar } = siteConfig.branding
const { name } = siteConfig.business
const { bio, focus, stats, rating, statsClose } = siteConfig.content.about

export default function AboutSection() {
  return (
    <AboutLayout
      imageSrc={avatar}
      imageAlt={`About ${name}`}
      title="About"
      titleGradient={name}
      paragraphs={[
        bio,
        <>
          {focus} {stats}{' '}
          <Link
            className="text-primary-500 dark:text-primary-400 font-bold underline-offset-0 transition-transform duration-300 hover:scale-105 hover:underline"
            href={'/reviews'}
          >
            {rating}
          </Link>
          {statsClose}
        </>,
      ]}
    />
  )
}
