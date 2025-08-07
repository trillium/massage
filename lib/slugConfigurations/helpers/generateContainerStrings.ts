import siteMetadata from '@/data/siteMetadata'
import { SlugConfigurationType } from '@/lib/types'

/**
 * Generates container strings for event management
 */
export function generateContainerStrings(
  bookingSlug?: string,
  configuration?: SlugConfigurationType
) {
  // Use eventContainer if available, otherwise fall back to bookingSlug
  const containerSlug = configuration?.eventContainer || bookingSlug || ''
  const baseString = containerSlug + siteMetadata.eventBaseString

  return {
    eventBaseString: baseString,
    eventMemberString: baseString + 'MEMBER__',
    eventContainerString: baseString + 'CONTAINER__',
  }
}
