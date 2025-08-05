import { SlugConfigurationType } from '@/lib/types'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { initialState } from '@/redux/slices/configSlice'

/**
 * Resolves the configuration for a booking slug, applying any overrides
 */
export async function resolveConfiguration(
  bookingSlug?: string,
  overrides?: Partial<SlugConfigurationType>
): Promise<SlugConfigurationType> {
  const slugData = await fetchSlugConfigurationData()
  let configuration: SlugConfigurationType

  if (bookingSlug) {
    const baseConfig = slugData[bookingSlug] ?? initialState

    // Create a deep copy to avoid mutating the shared configuration object
    configuration = { ...baseConfig }
  } else {
    configuration = initialState
  }

  if (configuration && overrides) {
    Object.assign(configuration, overrides)
  }

  return configuration
}
