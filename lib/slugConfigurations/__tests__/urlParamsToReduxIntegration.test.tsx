import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render, act } from '@testing-library/react'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import configReducer, {
  setLocation,
  updateLocationField,
  initialState as configInitialState,
} from '@/redux/slices/configSlice'
import formReducer, { setForm, initialBookingFormData } from '@/redux/slices/formSlice'
import { parseLocationFromParams } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import type { LocationObject } from '@/lib/types'
import type { RootState } from '@/redux/store'

// Create a test store
const createTestStore = () =>
  configureStore({
    reducer: {
      config: configReducer,
      form: formReducer,
    },
  })

// Test component that simulates URL params consumption
const URLParamsConsumer: React.FC<{ searchParams: URLSearchParams }> = ({ searchParams }) => {
  const dispatch = useDispatch()
  const configLocation = useSelector((state: RootState) => state.config.location)
  const formData = useSelector((state: RootState) => state.form)

  useEffect(() => {
    // Simulate consuming URL params and dispatching to Redux
    const locationFromParams = parseLocationFromParams(searchParams)

    // Update config slice location
    if (locationFromParams.street || locationFromParams.city || locationFromParams.zip) {
      dispatch(setLocation(locationFromParams))
    }

    // Also update form data with location object
    if (locationFromParams.street || locationFromParams.city || locationFromParams.zip) {
      dispatch(setForm({ location: locationFromParams }))
    }
  }, [searchParams, dispatch])

  return (
    <div data-testid="url-params-consumer">
      <div data-testid="config-location">{JSON.stringify(configLocation)}</div>
      <div data-testid="form-city">{formData.location?.city}</div>
      <div data-testid="form-zip">{formData.location?.zip}</div>
    </div>
  )
}

describe('URL Search Params to Redux Integration', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic URL Parameter Consumption', () => {
    it('should parse URL params and dispatch location to config slice', () => {
      const searchParams = new URLSearchParams('street=123+Main+St&city=Los+Angeles&zip=90210')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '123 Main St',
        city: 'Los Angeles',
        zip: '90210',
      })
    })

    it('should update form slice with city and zip from URL params', () => {
      const searchParams = new URLSearchParams('city=Los+Angeles&zip=90210')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

      const formState = store.getState().form
      expect(formState.location.city).toBe('Los Angeles')
      expect(formState.location.zip).toBe('90210')
    })

    it('should handle partial URL parameters', () => {
      const searchParams = new URLSearchParams('city=San+Diego')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

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

    it('should not update Redux when no location params are provided', () => {
      const searchParams = new URLSearchParams('other=value&another=param')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

      const configState = store.getState().config
      const formState = store.getState().form

      // Should remain at initial state
      expect(configState.location).toBe(configInitialState.location)
      expect(formState.location.city).toBe(initialBookingFormData.location?.city)
      expect(formState.location.zip).toBe(initialBookingFormData.location?.zip)
    })
  })

  describe('Redux Action Integration', () => {
    it('should properly dispatch setLocation action with parsed URL data', async () => {
      const searchParams = new URLSearchParams('street=456+Oak+Ave&city=Beverly+Hills&zip=90210')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

      // Check that the action was dispatched by verifying the store state
      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '456 Oak Ave',
        city: 'Beverly Hills',
        zip: '90210',
      })
    })

    it('should dispatch setForm action with city and zip data', async () => {
      const searchParams = new URLSearchParams('city=Playa+Vista&zip=90094')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

      // Check that form state was updated
      const formState = store.getState().form
      expect(formState.location.city).toBe('Playa Vista')
      expect(formState.location.zip).toBe('90094')
    })
  })

  describe('updateLocationField Action', () => {
    it('should update individual location fields in config slice', () => {
      // First set some initial location
      store.dispatch(
        setLocation({
          street: '123 Main St',
          city: 'Los Angeles',
          zip: '90210',
        })
      )

      // Update city field
      store.dispatch(updateLocationField({ field: 'city', value: 'San Diego' }))

      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '123 Main St',
        city: 'San Diego',
        zip: '90210',
      })
    })

    it('should create location object if it does not exist when updating field', () => {
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
    it('should handle URL-encoded characters in location data', () => {
      const searchParams = new URLSearchParams(
        'street=123%20Main%20St%20%23A&city=Los%20Angeles&zip=90210-1234'
      )

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

      const configState = store.getState().config
      expect(configState.location).toEqual({
        street: '123 Main St #A',
        city: 'Los Angeles',
        zip: '90210-1234',
      })
    })

    it('should handle plus signs in URL parameters', () => {
      const searchParams = new URLSearchParams('street=123+Main+St+Apt+5&city=Playa+del+Rey')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

      const configState = store.getState().config
      expect(configState.location?.street).toBe('123 Main St Apt 5')
      expect(configState.location?.city).toBe('Playa del Rey')
    })
  })

  describe('Component Integration', () => {
    it('should render location data from Redux state after URL params consumption', () => {
      const searchParams = new URLSearchParams('street=789+Pine+St&city=Kentwood&zip=90045')

      const { getByTestId } = render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={searchParams} />
        </Provider>
      )

      const configLocationElement = getByTestId('config-location')
      const formCityElement = getByTestId('form-city')
      const formZipElement = getByTestId('form-zip')

      expect(configLocationElement.textContent).toBe(
        JSON.stringify({
          street: '789 Pine St',
          city: 'Kentwood',
          zip: '90045',
        })
      )
      expect(formCityElement.textContent).toBe('Kentwood')
      expect(formZipElement.textContent).toBe('90045')
    })

    it('should update Redux state when URL params change', () => {
      const { rerender } = render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={new URLSearchParams('city=Los+Angeles&zip=90210')} />
        </Provider>
      )

      // Check initial state
      expect(store.getState().config.location?.city).toBe('Los Angeles')
      expect(store.getState().form.location.city).toBe('Los Angeles')

      // Change URL params
      rerender(
        <Provider store={store}>
          <URLParamsConsumer searchParams={new URLSearchParams('city=San+Diego&zip=92101')} />
        </Provider>
      )

      // Check updated state
      expect(store.getState().config.location?.city).toBe('San Diego')
      expect(store.getState().config.location?.zip).toBe('92101')
      expect(store.getState().form.location.city).toBe('San Diego')
      expect(store.getState().form.location.zip).toBe('92101')
    })
  })

  describe('Slug-based Location Configuration', () => {
    it('should handle location data for specific city slugs', () => {
      // Test for Playa Vista
      const playaVistaParams = new URLSearchParams('city=Playa+Vista&zip=90094')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={playaVistaParams} />
        </Provider>
      )

      const configState = store.getState().config
      expect(configState.location?.city).toBe('Playa Vista')
      expect(configState.location?.zip).toBe('90094')
    })

    it('should handle location data for Westchester', () => {
      const westchesterParams = new URLSearchParams('city=Westchester&zip=90045')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={westchesterParams} />
        </Provider>
      )

      const configState = store.getState().config
      expect(configState.location?.city).toBe('Westchester')
      expect(configState.location?.zip).toBe('90045')
    })

    it('should handle San Diego location data', () => {
      const sanDiegoParams = new URLSearchParams('city=San+Diego&zip=92101')

      render(
        <Provider store={store}>
          <URLParamsConsumer searchParams={sanDiegoParams} />
        </Provider>
      )

      const configState = store.getState().config
      expect(configState.location?.city).toBe('San Diego')
      expect(configState.location?.zip).toBe('92101')
    })
  })
})
