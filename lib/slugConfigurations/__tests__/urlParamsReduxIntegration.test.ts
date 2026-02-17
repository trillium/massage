import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

import configReducer, {
  setLocation,
  updateLocationField,
  initialState as configInitialState,
} from '@/redux/slices/configSlice'
import formReducer, { setForm, initialBookingFormData } from '@/redux/slices/formSlice'
import { parseLocationFromParams } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import type { LocationObject } from '@/lib/types'

// Create test store
const createTestStore = () =>
  configureStore({
    reducer: {
      config: configReducer,
      form: formReducer,
    },
  })

// URL Parameters consumption function that would be used in real components
const consumeUrlParamsToRedux = (
  searchParams: URLSearchParams,
  dispatch: ReturnType<typeof createTestStore>['dispatch']
) => {
  const locationFromParams = parseLocationFromParams(searchParams)

  // Update config slice location if any location data exists
  if (locationFromParams.street || locationFromParams.city || locationFromParams.zip) {
    dispatch(setLocation(locationFromParams))
  }

  // Update form slice with location object
  if (locationFromParams.street || locationFromParams.city || locationFromParams.zip) {
    dispatch(setForm({ location: locationFromParams }))
  }
}

describe('URL Parameters to Redux Integration (Pure Functions)', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('URL Parameter Consumption Function', () => {
    it('should consume URL params and update Redux config location', () => {
      const searchParams = new URLSearchParams('street=123+Main+St&city=Los+Angeles&zip=90210')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      })
    })

    it('should update form slice with city and zip data', () => {
      const searchParams = new URLSearchParams('city=Playa+Vista&zip=90094')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const formState = store.getState().form
      expect(formState.location.city).toBe('Playa Vista')
      expect(formState.location.zip).toBe('90094')

      // Config should also be updated
      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '',
        city: 'Playa Vista',
        zip: '90094',
      })
    })

    it('should handle partial location data', () => {
      const searchParams = new URLSearchParams('city=San+Diego')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      const formState = store.getState().form

      expect(configState.location).toEqual({
        street: '',
        city: 'San Diego',
        zip: '',
      })
      expect(formState.location.city).toBe('San Diego')
      expect(formState.location.zip).toBe('') // Should remain empty
    })

    it('should not update Redux when no location params are present', () => {
      const searchParams = new URLSearchParams('other=value&another=param')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      const formState = store.getState().form

      // Should remain at initial state
      expect(configState.location).toBe(configInitialState.location)
      expect(formState.location.city).toBe(initialBookingFormData.location?.city)
      expect(formState.location.zip).toBe(initialBookingFormData.location?.zip)
    })
  })

  describe('Specific Location Configurations', () => {
    it('should handle Playa Vista configuration', () => {
      const searchParams = new URLSearchParams('city=Playa+Vista&zip=90094')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      const formState = store.getState().form

      expect(configState.location?.city).toBe('Playa Vista')
      expect(configState.location?.zip).toBe('90094')
      expect(formState.location.city).toBe('Playa Vista')
      expect(formState.location.zip).toBe('90094')
    })

    it('should handle Westchester configuration', () => {
      const searchParams = new URLSearchParams('city=Westchester&zip=90045')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      const formState = store.getState().form

      expect(configState.location?.city).toBe('Westchester')
      expect(configState.location?.zip).toBe('90045')
      expect(formState.location.city).toBe('Westchester')
      expect(formState.location.zip).toBe('90045')
    })

    it('should handle Kentwood configuration', () => {
      const searchParams = new URLSearchParams('city=Kentwood&zip=90045')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      expect(configState.location?.city).toBe('Kentwood')
      expect(configState.location?.zip).toBe('90045')
    })

    it('should handle Playa del Rey configuration', () => {
      const searchParams = new URLSearchParams('city=Playa+del+Rey&zip=90293')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      expect(configState.location?.city).toBe('Playa del Rey')
      expect(configState.location?.zip).toBe('90293')
    })

    it('should handle San Diego configuration', () => {
      const searchParams = new URLSearchParams('city=San+Diego&zip=92101')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      const formState = store.getState().form

      expect(configState.location?.city).toBe('San Diego')
      expect(configState.location?.zip).toBe('92101')
      expect(formState.location.city).toBe('San Diego')
      expect(formState.location.zip).toBe('92101')
    })
  })

  describe('Redux Actions Integration', () => {
    it('should properly dispatch setLocation with complete address', () => {
      const searchParams = new URLSearchParams('street=456+Ocean+Ave&city=Beverly+Hills&zip=90210')

      const initialState = store.getState()
      consumeUrlParamsToRedux(searchParams, store.dispatch)
      const finalState = store.getState()

      // Verify state changed
      expect(finalState.config.location).not.toBe(initialState.config.location)
      expect(finalState.config.location).toEqual({
        street: '456 Ocean Ave',
        city: 'Beverly Hills',
        zip: '90210',
      })
    })

    it('should dispatch updateLocationField action equivalently', () => {
      // First set initial location
      store.dispatch(
        setLocation({
          street: '123 Main St',
          city: 'Los Angeles',
          zip: '90210',
        })
      )

      // Update individual field
      store.dispatch(updateLocationField({ field: 'city', value: 'San Diego' }))

      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '123 Main St',
        city: 'San Diego',
        zip: '90210',
      })
    })

    it('should create location object when updating field on null location', () => {
      // Ensure no location exists
      expect(store.getState().config.location).toBe(null)

      // Update a field
      store.dispatch(updateLocationField({ field: 'city', value: 'Westchester' }))

      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '',
        city: 'Westchester',
        zip: '',
      })
    })
  })

  describe('Special Characters and Encoding', () => {
    it('should handle URL-encoded special characters', () => {
      const searchParams = new URLSearchParams(
        'street=123%20Main%20St%20%23A&city=Los%20Angeles&zip=90210-1234'
      )

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '123 Main St #A',
        city: 'Los Angeles',
        zip: '90210-1234',
      })
    })

    it('should handle plus signs and spaces in URL params', () => {
      const searchParams = new URLSearchParams('street=123+Main+St+Apt+5&city=Playa+del+Rey')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      expect(configState.location?.street).toBe('123 Main St Apt 5')
      expect(configState.location?.city).toBe('Playa del Rey')
    })

    it('should handle malformed parameters gracefully', () => {
      const searchParams = new URLSearchParams('city=%20&zip=invalid&street=')

      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '',
        city: ' ', // Decoded space
        zip: 'invalid',
      })
    })
  })

  describe('State Persistence and Updates', () => {
    it('should maintain other Redux state when updating location', () => {
      // Set some initial form data
      store.dispatch(
        setForm({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        })
      )

      const initialFormData = store.getState().form

      // Update location via URL params
      const searchParams = new URLSearchParams('city=Los+Angeles&zip=90210')
      consumeUrlParamsToRedux(searchParams, store.dispatch)

      const finalFormData = store.getState().form

      // Location fields should be updated
      expect(finalFormData.location.city).toBe('Los Angeles')
      expect(finalFormData.location.zip).toBe('90210')

      // Other fields should remain unchanged
      expect(finalFormData.firstName).toBe(initialFormData.firstName)
      expect(finalFormData.lastName).toBe(initialFormData.lastName)
      expect(finalFormData.email).toBe(initialFormData.email)
    })

    it('should handle multiple consecutive updates', () => {
      // First update
      const firstParams = new URLSearchParams('city=Los+Angeles&zip=90210')
      consumeUrlParamsToRedux(firstParams, store.dispatch)

      expect(store.getState().config.location?.city).toBe('Los Angeles')
      expect(store.getState().form.location.city).toBe('Los Angeles')

      // Second update
      const secondParams = new URLSearchParams('city=San+Diego&zip=92101')
      consumeUrlParamsToRedux(secondParams, store.dispatch)

      expect(store.getState().config.location?.city).toBe('San Diego')
      expect(store.getState().config.location?.zip).toBe('92101')
      expect(store.getState().form.location.city).toBe('San Diego')
      expect(store.getState().form.location.zip).toBe('92101')
    })
  })
})
