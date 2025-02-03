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

type createPageConfigurationProps = {
  bookingSlug?: string
  resolvedParams: SearchParamsType
}

export async function createPageConfiguration({
  bookingSlug,
  resolvedParams,
}: createPageConfigurationProps) {
  const slugData = await fetchSlugConfigurationData()
  let configuration: SlugConfigurationType
  if (!!bookingSlug) {
    configuration = slugData[bookingSlug] ?? null
  } else {
    configuration = initialState
  }

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
  const end = dayFromString(data.end)

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
  }

  return {
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
}
