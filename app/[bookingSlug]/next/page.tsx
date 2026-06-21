import { Metadata } from 'next'
import { SearchParamsType } from '@/lib/types'
import NotFound from 'app/not-found'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import ExpiredPromoPage from '@/components/ExpiredPromoPage'
import NextSessionFeature from '@/components/booking/features/NextSessionFeature'
import SlugAnalytics from '@/components/SlugAnalytics'
import SectionContainer from '@/components/SectionContainer'
import { H1, H2 } from '@/components/ui/heading'
import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { genPageMetadata } from 'app/seo'
import siteMetadata from '@/data/siteMetadata'
import { format } from 'date-fns-tz'
import { OWNER_TIMEZONE } from 'config'
import { home } from '@/app/content'

export const dynamic = 'force-dynamic'

function firstLineOfText(text: string | string[] | null): string {
  if (!text) return ''
  if (Array.isArray(text)) return text[0] ?? ''
  return text
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookingSlug: string }>
}): Promise<Metadata> {
  const { bookingSlug } = await params
  const configMap = await fetchSlugConfigurationData()
  const config = configMap[bookingSlug]
  const title = config?.title ? `${config.title} — Next slot` : 'Next available slot'
  const description = firstLineOfText(config?.text ?? null) || siteMetadata.description
  return genPageMetadata({ title, description })
}

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParamsType>
  params: Promise<{ bookingSlug: string }>
}) {
  const { bookingSlug } = await params
  const resolvedParams = await searchParams

  const result = await createPageConfiguration({
    bookingSlug,
    resolvedParams,
    overrides: { nextSlotOnly: true, hideCalendar: true },
  })

  if (result.configuration === null || result.configuration === undefined) {
    return <NotFound />
  }

  if (result.isExpired && result.configuration.promoEndDate) {
    return (
      <ExpiredPromoPage
        title={result.configuration.title || 'Promotion Expired'}
        promoEndDate={result.configuration.promoEndDate}
        originalText={result.configuration.text}
      />
    )
  }

  const { durationProps, configuration, selectedDate, slots, duration, data, start, end } = result

  if (!slots || slots.length === 0) {
    const headingTitle = configuration.title || home.bookingTitle || 'Book a session'
    return (
      <>
        <SlugAnalytics slug={bookingSlug} />
        <SectionContainer>
          <Stack direction="col" gap={4}>
            <H1>{headingTitle}</H1>
            <H2 status="muted">{'No sessions available right now'}</H2>
            <TextBase status="muted">
              {'Check back soon — new availability opens throughout the day.'}
            </TextBase>
          </Stack>
        </SectionContainer>
      </>
    )
  }

  const startTimeLabel = format(new Date(slots[0].start), 'h:mm a', {
    timeZone: OWNER_TIMEZONE,
  })

  return (
    <>
      <SlugAnalytics slug={bookingSlug} />
      <NextSessionFeature
        durationProps={durationProps}
        configuration={configuration}
        selectedDate={selectedDate}
        slots={slots}
        duration={duration}
        data={data}
        start={start}
        end={end}
        startTimeLabel={startTimeLabel}
      />
    </>
  )
}
