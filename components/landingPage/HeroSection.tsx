import Image from 'next/image'
import Link from '@/components/Link'
import clsx from 'clsx'
import { FaCar, FaRegClock } from 'react-icons/fa'
import { FiMapPin } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'
import { GradientText } from '@/components/ui/GradientText'
import { H1, H2 } from '@/components/ui/heading'
import { TextSm, TextBase } from '@/components/ui/text'
import { home, site } from '@/app/content'
import landing from '@/data/landing.json'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const { hero } = home
const { neighborhood, serviceArea } = site.location
const { bookButton, exploreButton, openDays, basedLabel } = landing.hero

export default function HeroSection() {
  return (
    <section className="flex w-full flex-col items-center gap-8 overflow-x-clip">
      <Box className="container grid w-full grid-cols-1 items-stretch gap-8 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr]">
        <TextContent positionClasses="md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-2" />

        <ImageContent positionClasses="md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-3" />

        <ButtonContent positionClasses="md:col-start-1 md:col-end-2 md:row-start-2 md:row-end-3 " />
      </Box>
    </section>
  )
}

function TextContent({ positionClasses }: { positionClasses?: string }) {
  const headlineParts = hero.headline.split(hero.gradientWord)
  return (
    <Stack
      direction="col"
      align="center"
      className={clsx('h-full space-y-4 text-center md:text-left', positionClasses)}
    >
      <Box>
        <H1 className="md:text-5xl lg:text-6xl" data-content="hero.headline">
          {headlineParts[0]}
          <GradientText>{hero.gradientWord}</GradientText>
          {headlineParts[1]}
        </H1>
        <H2 className="mx-auto mt-4 max-w-lg md:mx-0" data-content="hero.subheading" status="muted">
          {hero.subheading}
        </H2>
        <TextBase
          className="mx-auto mt-4 max-w-lg text-xl text-accent-600 md:mx-0 dark:text-accent-300"
          data-content="hero.description"
        >
          {hero.description}
        </TextBase>
      </Box>
    </Stack>
  )
}

function ImageContent({ positionClasses }: { positionClasses?: string }) {
  return (
    <Box className={clsx('relative flex-1', positionClasses)}>
      <Box className="border-primary-500 relative h-72 w-full overflow-hidden rounded-lg border-2 sm:h-100 md:h-128 lg:h-148 xl:h-152">
        {
          <Image
            src={'/static/images/table/table_square_02.webp'}
            alt="Massage therapy session"
            fill
            className="object-cover"
            priority
          />
        }
        <Box className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent"></Box>
      </Box>
      <Stack
        className="bg-primary-100 absolute -bottom-6 -left-6 h-24 w-24 rounded-full"
        direction="row"
        align="center"
        justify="center"
      >
        <HiSparkles className="text-primary-600 h-10 w-10" />
      </Stack>
    </Box>
  )
}

function ButtonContent({ positionClasses }: { positionClasses?: string }) {
  return (
    <Stack
      direction="col"
      justify="end"
      className={clsx('h-full space-y-4 text-center md:text-left', positionClasses)}
    >
      <Stack className="gap-y-4" direction="col">
        <Box className="sm:grid-span-1 col-span-2 grid grid-cols-1 gap-2 sm:col-span-1 sm:grid-cols-2">
          <Link
            href="/book"
            className="bg-primary-600 hover:bg-primary-700 border-primary-500 mt-auto inline-block w-full rounded border-2 px-4 py-2 text-center font-semibold text-white transition-colors"
          >
            {bookButton}
          </Link>

          <Link
            href="/services"
            className="text-md border-primary-500 text-primary-600 mt-auto inline-block w-full rounded border-2 bg-surface-50 px-4 py-2 text-center font-semibold transition-colors hover:bg-surface-200"
          >
            {exploreButton}
          </Link>
        </Box>
        <Stack
          direction="col"
          wrap
          gap={2}
          className="xs:flex-col justify-around gap-y-6 sm:flex-row md:flex-col xl:flex-row"
        >
          <Stack direction="row" align="center" gap={2}>
            <FaRegClock className="h-5 w-5 text-primary-600" />
            <TextSm className="whitespace-nowrap">{openDays}</TextSm>
          </Stack>
          <Stack direction="row" align="center" gap={2}>
            <FiMapPin className="h-5 w-5 text-primary-600" />
            <TextSm className="whitespace-nowrap">
              {neighborhood} {basedLabel}
            </TextSm>
          </Stack>
          <Stack direction="row" align="center" gap={2}>
            <FaCar className="h-5 w-5 text-primary-600" />
            <TextSm className="whitespace-nowrap">{serviceArea}</TextSm>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}
