import Image from 'next/image'
import Link from '@/components/Link'
import { GradientText } from '@/components/ui/GradientText'
import { ReactNode } from 'react'

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
            <p key={idx} className={`text-lg text-gray-600 dark:text-gray-300 ${idx === 0 ? 'mt-4' : ''}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

import siteMetadata from '@/data/siteMetadata'

const { avatar } = siteMetadata

export default function AboutSection() {
  return (
    <AboutLayout
      imageSrc={avatar}
      imageAlt="About our massage therapist (placeholder)"
      title="About"
      titleGradient="Trillium Massage"
      paragraphs={[
        'Trillium is a massage therapist with 10 years of experience. Working in the LA Metro Area, Trillium found success in specializing in In-Home mobile massage therapy, working solo and through platforms like Soothe and Zeel since 2016.',
        (
          <>
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
          </>
        ),
      ]}
    />
  )
}
