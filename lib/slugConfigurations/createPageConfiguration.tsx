import { normalizeYYYYMMDD } from '../helpers'
import siteMetadata from '@/data/siteMetadata'
import { fetchContainersByQuery } from '@/lib/fetch/fetchContainersByQuery'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { createSlots } from '@/lib/availability/createSlots'
import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING, LEAD_TIME } from 'config'
import { dayFromString } from '@/lib/dayAsObject'
import { SearchParamsType, SlugConfigurationType } from '@/lib/types'
import { fetchData } from '@/lib/fetch/fetchData'
import { validateSearchParams } from '@/lib/searchParams/validateSearchParams'
import { initialState } from '@/redux/slices/configSlice'
import { isPromoExpired } from '../utilities/promoValidation'

type createPageConfigurationProps = {
  bookingSlug?: string
  resolvedParams: SearchParamsType
  overrides?: Partial<SlugConfigurationType>
}

export async function createPageConfiguration({
  bookingSlug,
  resolvedParams,
  overrides,
}: createPageConfigurationProps) {
  const slugData = await fetchSlugConfigurationData()
  let configuration: SlugConfigurationType
  if (bookingSlug) {
    configuration = slugData[bookingSlug] ?? null
  } else {
    configuration = initialState
  }

  Object.assign(configuration, overrides)

  let data

  if (configuration?.type === 'scheduled-site' && !!bookingSlug) {
    data = await fetchContainersByQuery({
      searchParams: resolvedParams,
      query: bookingSlug,
    })
  } else {
    data = await fetchData({ searchParams: resolvedParams })
  }

  const { duration, selectedDate } = validateSearchParams({ searchParams: resolvedParams })

  const start = dayFromString(data.start)

  let end = dayFromString(data.end)
  // Limit end to the earlier of data.end and promoEndDate (inclusive) if present
  if (configuration?.promoEndDate) {
    const normalizedPromoEnd = normalizeYYYYMMDD(configuration.promoEndDate)
    if (normalizedPromoEnd < data.end) {
      end = dayFromString(normalizedPromoEnd)
    }
  }

  const leadTime = configuration?.leadTimeMinimum ?? LEAD_TIME

  const slots = createSlots({
    start,
    end,
    busy: data.busy,
    ...data.data,
    duration,
    leadTime,
  })

  const containerStrings = {
    eventBaseString: bookingSlug + siteMetadata.eventBaseString,
    eventMemberString: bookingSlug + siteMetadata.eventBaseString + 'MEMBER__',
    eventContainerString: bookingSlug + siteMetadata.eventBaseString + 'CONTAINER__',
  }

  const pricing = configuration?.price || DEFAULT_PRICING
  const durationString = `${duration || '##'} minute session`
  const paymentString = configuration?.acceptingPayment ?? ' - $' + pricing[duration]
  const combinedString = durationString + paymentString

  const allowedDurations = configuration?.allowedDurations ?? ALLOWED_DURATIONS

  const durationProps = {
    title: combinedString,
    price: pricing,
    duration: duration,
    allowedDurations,
    configuration,
  }

  const returnObj = {
    isExpired: false,
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
  }

  if (configuration && configuration.promoEndDate && isPromoExpired(configuration.promoEndDate)) {
    returnObj.isExpired = true
  }

  return returnObj
}
