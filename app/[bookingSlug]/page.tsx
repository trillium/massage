import { Metadata } from 'next'
import { SearchParamsType } from '@/lib/types'
import NotFound from 'app/not-found'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import ExpiredPromoPage from '@/components/ExpiredPromoPage'
import GeneralBookingFeature from '@/components/booking/features/GeneralBookingFeature'
import SlugAnalytics from '@/components/SlugAnalytics'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { genPageMetadata } from 'app/seo'
import siteMetadata from '@/data/siteMetadata'

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
  const title = config?.title ?? 'Book a massage'
  const description = firstLineOfText(config?.text ?? null) || siteMetadata.description
  const siteUrl = (siteMetadata.siteUrl as string).replace(/\/$/, '')
  const ogImage = `${siteUrl}/${bookingSlug}/opengraph-image`
  return genPageMetadata({ title, description, image: ogImage })
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

  const result = await createPageConfiguration({ bookingSlug, resolvedParams })

  if (result.configuration === null || result.configuration === undefined) {
    return <NotFound></NotFound>
  }

  // Check if this is an expired promotion
  if (result.isExpired && result.configuration.promoEndDate) {
    return (
      <ExpiredPromoPage
        title={result.configuration.title || 'Promotion Expired'}
        promoEndDate={result.configuration.promoEndDate}
        originalText={result.configuration.text}
      />
    )
  }

  const {
    durationProps,
    configuration,
    selectedDate,
    allowedDurations,
    slots,
    containerStrings,
    duration,
    data,
    start,
    end,
  } = result

  return (
    <>
      <SlugAnalytics slug={bookingSlug} />
      <GeneralBookingFeature
        durationProps={durationProps}
        configuration={configuration}
        selectedDate={selectedDate}
        slots={slots}
        duration={duration}
        data={data}
        start={start}
        end={end}
      />
    </>
  )
}
