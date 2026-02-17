interface ClientInfo {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

export function createBookingUrl(
  bookingSlug: string | null,
  location?: string,
  clientInfo?: ClientInfo
): string {
  const baseUrl = bookingSlug ? `/${bookingSlug}` : '/book'
  const params = new URLSearchParams()

  if (location) {
    const cityMatch = location.match(/,\s*([^,]+),\s*[A-Z]{2}\s*(\d{5})/i)
    if (cityMatch) {
      params.set('city', cityMatch[1].trim())
      params.set('zip', cityMatch[2])
    } else {
      const simpleCityMatch = location.match(/,\s*([^,\d]+)/i)
      if (simpleCityMatch) {
        params.set('city', simpleCityMatch[1].trim())
      }
    }

    const streetMatch = location.match(/^([^,]+)/)
    if (streetMatch) {
      params.set('street', streetMatch[1].trim())
    }
  }

  if (clientInfo) {
    if (clientInfo.firstName) params.set('firstName', clientInfo.firstName)
    if (clientInfo.lastName) params.set('lastName', clientInfo.lastName)
    if (clientInfo.email) params.set('email', clientInfo.email)
    if (clientInfo.phone) params.set('phone', clientInfo.phone)
  }

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}
