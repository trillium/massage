export function buildBookingPayload(formData: FormData, additionalData: object = {}) {
  const entries = Object.fromEntries(formData)

  // Check if we have location-related fields
  const hasLocationFields = entries.location || entries.city || entries.zipCode

  if (hasLocationFields) {
    // Transform individual location fields into locationString
    const locationString = [
      (entries.location as string) || '',
      (entries.city as string) || '',
      (entries.zipCode as string) || '',
    ]
      .filter(Boolean)
      .join(', ')

    // Remove individual location fields and add locationString
    const { location: _, city, zipCode, ...restEntries } = entries as Record<string, unknown>

    return {
      ...restEntries,
      locationString,
      // Include promo and bookingUrl if they exist in the form data
      ...(entries.promo && { promo: entries.promo }),
      ...(entries.bookingUrl && { bookingUrl: entries.bookingUrl }),
      ...additionalData,
    }
  }

  // If no location fields, return as before but include promo and bookingUrl
  return {
    ...entries,
    // Include promo and bookingUrl if they exist in the form data
    ...(entries.promo && { promo: entries.promo }),
    ...(entries.bookingUrl && { bookingUrl: entries.bookingUrl }),
    ...additionalData,
  }
}
