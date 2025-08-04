import siteMetadata from '@/data/siteMetadata'

/**
 * Generates container strings for event management
 */
export function generateContainerStrings(bookingSlug?: string) {
  const baseString = (bookingSlug || '') + siteMetadata.eventBaseString

  return {
    eventBaseString: baseString,
    eventMemberString: baseString + 'MEMBER__',
    eventContainerString: baseString + 'CONTAINER__',
  }
}
