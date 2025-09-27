import { SlugConfigurationType } from '@/lib/types'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { initialState } from '@/redux/slices/configSlice'

/**
 * Resolves the configuration for a booking slug, applying any overrides
 */
export async function resolveConfiguration(
  bookingSlug?: string,
  overrides?: Partial<SlugConfigurationType>,
  debug?: boolean
): Promise<{
  configuration: SlugConfigurationType
  debugInfo?: { inputs: Record<string, unknown>; outputs: Record<string, unknown> }
}> {
  const debugInfo = debug ? { inputs: { bookingSlug, overrides }, outputs: {} } : undefined

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

  if (debugInfo) debugInfo.outputs = { configuration }

  return { configuration, debugInfo }
}
