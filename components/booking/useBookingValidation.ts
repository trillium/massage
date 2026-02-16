import { z } from 'zod'
import { LocationObject } from 'lib/types'
import { SlugConfigurationType } from 'lib/configTypes'
import { createBookingFormSchema, BookingFormValues } from '@/lib/bookingFormSchema'

export function useBookingValidation(config: SlugConfigurationType) {
  const validateForm = (values: BookingFormValues) => {
    try {
      const schema = createBookingFormSchema({})
      schema.parse(values)
      return {}
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string | Record<string, string>> = {}
        error.issues.forEach((issue) => {
          if (issue.path.length === 0) return

          const path = issue.path.join('.')

          if (issue.path.length > 1) {
            const [parent, ...childPath] = issue.path
            if (!errors[parent as string]) {
              errors[parent as string] = {}
            }
            errors[parent as string][childPath.join('.')] = issue.message
          } else {
            errors[path] = issue.message
          }
        })
        return errors
      }
      return {}
    }
  }

  const getLocationWarning = (location: LocationObject): string | undefined => {
    if (!config.locationWarning) return undefined

    const warning = config.locationWarning

    if ('city' in warning && location.city) {
      const normalizedInputCity = location.city.toLowerCase().trim()
      const normalizedWarningCity = warning.city.toLowerCase().trim()

      if (normalizedInputCity === normalizedWarningCity) {
        return undefined
      }

      return warning.message
    }

    if ('zip' in warning && location.zip) {
      if (location.zip === warning.zip) {
        return undefined
      }

      return warning.message
    }

    return undefined
  }

  return { validateForm, getLocationWarning }
}
