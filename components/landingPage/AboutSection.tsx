import Image from 'next/image'
import Link from '@/components/Link'
import { GradientText } from '@/components/ui/GradientText'
import { H2 } from '@/components/ui/heading'
import { TextLgMuted } from '@/components/ui/text'
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
    <section className="overflow-hidden">
      <Box className="container grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <Box className="relative h-[400px] w-full md:h-[500px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className={`border-primary-500 rounded-lg border-2 object-cover ${imagePosition} shadow-lg`}
            priority
          />
        </Box>
        <Stack className="h-full space-y-4 text-left" direction="col" justify="center">
          <H2 className="text-left md:text-5xl lg:text-6xl">
            {title} <GradientText classes="whitespace-nowrap">{titleGradient}</GradientText>
          </H2>
          {paragraphs.map((paragraph, idx) => (
            <TextLgMuted key={idx} className="${idx === 0 ? 'mt-4' : ''}">
              {paragraph}
            </TextLgMuted>
          ))}
        </Stack>
      </Box>
    </section>
  )
}

import { home, site } from '@/app/content'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const { avatar } = site.branding
const { name } = site.business
const { bio, focus, stats, rating, statsClose } = home.about

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
