import { z } from 'zod'
import { LocationObject } from 'lib/types'

// Configuration type for location validation
export type LocationValidationConfig = {
  cities?: string[]
  zipCodes?: string[]
}

// Validation errors type
export type LocationValidationErrors = {
  street?: string
  city?: string
  zip?: string
}

// Create dynamic Zod schema based on validation config
export const createLocationSchema = (config?: LocationValidationConfig) => {
  return z.object({
    street: z.string().min(1, 'Required'),
    city: z.string().min(1, 'Required'), // City is required for form submission
    zip: config?.zipCodes?.length
      ? z.string().refine((val) => config.zipCodes!.some((zip) => zip.trim() === val.trim()), {
          message: `Zip code must be one of: ${config.zipCodes.join(', ')}`,
        })
      : z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format'),
  })
}

// Main validation function using Zod
export const validateLocation = (
  location: LocationObject,
  config?: LocationValidationConfig
): LocationValidationErrors => {
  const schema = createLocationSchema(config)
  const result = schema.safeParse(location)

  if (!result.success) {
    const errors: LocationValidationErrors = {}
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors[issue.path[0] as keyof LocationValidationErrors] = issue.message
      }
    })
    return errors
  }

  return {}
}

// Type for the location schema (can be used for type inference)
export type LocationSchema = z.infer<ReturnType<typeof createLocationSchema>>
