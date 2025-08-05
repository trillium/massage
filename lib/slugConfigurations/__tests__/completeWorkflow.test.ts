import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

import configReducer, { setLocation } from '@/redux/slices/configSlice'
import formReducer, { setForm } from '@/redux/slices/formSlice'
import {
  parseLocationFromParams,
  updateUrlWithLocation,
  createLocationObject,
} from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import type { LocationObject } from '@/lib/types'

// Create test store
const createTestStore = () =>
  configureStore({
    reducer: {
      config: configReducer,
      form: formReducer,
    },
  })

// Mock window for URL manipulation tests
const mockWindow = {
  location: {
    pathname: '/test',
    search: '',
  },
  history: {
    replaceState: vi.fn(),
  },
}

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
})

describe('Complete URL Parameters to Redux Workflow', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
    mockWindow.history.replaceState.mockClear()
  })

  describe('End-to-End Workflow: URL → Parse → Redux → Update URL', () => {
    it('should complete full workflow for slug-based location configuration', () => {
      // Step 1: Start with URL parameters (simulating slug page load)
      const initialUrlParams = new URLSearchParams('city=Playa+Vista&zip=90094')

      // Step 2: Parse location from URL parameters
      const parsedLocation = parseLocationFromParams(initialUrlParams)
      expect(parsedLocation).toEqual({
        street: '',
        city: 'Playa Vista',
        zip: '90094',
      })

      // Step 3: Dispatch to Redux store
      store.dispatch(setLocation(parsedLocation))
      store.dispatch(
        setForm({
          city: parsedLocation.city,
          zipCode: parsedLocation.zip,
        })
      )

      // Step 4: Verify Redux state
      const configState = store.getState().config
      const formState = store.getState().form

      expect(configState.location).toEqual({
        street: '',
        city: 'Playa Vista',
        zip: '90094',
      })
      expect(formState.city).toBe('Playa Vista')
      expect(formState.zipCode).toBe('90094')

      // Step 5: User modifies location (e.g., adds street address)
      const updatedLocation = createLocationObject('123 Main St', 'Playa Vista', '90094')
      store.dispatch(setLocation(updatedLocation))

      // Step 6: Update URL with new location
      mockWindow.location.search = '?city=Playa+Vista&zip=90094'
      updateUrlWithLocation(updatedLocation)

      // Step 7: Verify URL was updated
      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        '/test?city=Playa+Vista&zip=90094&street=123+Main+St'
      )
    })

    it('should handle complete workflow for San Diego configuration', () => {
      // Simulate San Diego slug page
      const urlParams = new URLSearchParams('city=San+Diego&zip=92101')
      const location = parseLocationFromParams(urlParams)

      // Update Redux
      store.dispatch(setLocation(location))
      store.dispatch(
        setForm({
          city: location.city,
          zipCode: location.zip,
        })
      )

      // Verify state
      expect(store.getState().config.location?.city).toBe('San Diego')
      expect(store.getState().config.location?.zip).toBe('92101')
      expect(store.getState().form.city).toBe('San Diego')
      expect(store.getState().form.zipCode).toBe('92101')
    })

    it('should handle workflow for all planned slug configurations', () => {
      const slugConfigurations = [
        { city: 'Playa Vista', zip: '90094' },
        { city: 'Westchester', zip: '90045' },
        { city: 'Kentwood', zip: '90045' },
        { city: 'Playa del Rey', zip: '90293' },
        { city: 'San Diego', zip: '92101' },
      ]

      slugConfigurations.forEach(({ city, zip }) => {
        // Reset store for each test
        const freshStore = createTestStore()

        // Simulate URL params for this slug
        const urlParams = new URLSearchParams(`city=${encodeURIComponent(city)}&zip=${zip}`)
        const location = parseLocationFromParams(urlParams)

        // Update Redux
        freshStore.dispatch(setLocation(location))
        freshStore.dispatch(
          setForm({
            city: location.city,
            zipCode: location.zip,
          })
        )

        // Verify each configuration
        const configState = freshStore.getState().config
        const formState = freshStore.getState().form

        expect(configState.location?.city).toBe(city)
        expect(configState.location?.zip).toBe(zip)
        expect(formState.city).toBe(city)
        expect(formState.zipCode).toBe(zip)
      })
    })
  })

  describe('URL Parameter Validation and Error Handling', () => {
    it('should handle invalid or missing parameters gracefully', () => {
      const testCases = [
        { params: '', expectedCity: '', expectedZip: '' },
        { params: 'city=', expectedCity: '', expectedZip: '' },
        { params: 'zip=90210', expectedCity: '', expectedZip: '90210' },
        { params: 'other=value', expectedCity: '', expectedZip: '' },
        { params: 'city=%20&zip=invalid', expectedCity: ' ', expectedZip: 'invalid' },
      ]

      testCases.forEach(({ params, expectedCity, expectedZip }) => {
        const urlParams = new URLSearchParams(params)
        const location = parseLocationFromParams(urlParams)

        expect(location.city).toBe(expectedCity)
        expect(location.zip).toBe(expectedZip)
        expect(location.street).toBe('') // Should always be empty string
      })
    })

    it('should handle URL encoding and special characters', () => {
      const complexParams = new URLSearchParams(
        'street=123%20Main%20St%20%23A&city=Los%20Angeles&zip=90210-1234'
      )
      const location = parseLocationFromParams(complexParams)

      expect(location).toEqual({
        street: '123 Main St #A',
        city: 'Los Angeles',
        zip: '90210-1234',
      })
    })
  })

  describe('State Synchronization', () => {
    it('should keep Redux config and form state synchronized', () => {
      const location: LocationObject = {
        street: '456 Ocean Ave',
        city: 'Westchester',
        zip: '90045',
      }

      // Update config
      store.dispatch(setLocation(location))

      // Update form to match
      store.dispatch(
        setForm({
          city: location.city,
          zipCode: location.zip,
        })
      )

      // Verify synchronization
      const configState = store.getState().config
      const formState = store.getState().form

      expect(configState.location?.city).toBe(formState.city)
      expect(configState.location?.zip).toBe(formState.zipCode)
    })

    it('should handle partial updates without breaking synchronization', () => {
      // Set initial state
      store.dispatch(
        setLocation({
          street: '123 Main St',
          city: 'Los Angeles',
          zip: '90210',
        })
      )
      store.dispatch(
        setForm({
          city: 'Los Angeles',
          zipCode: '90210',
          firstName: 'John',
          email: 'john@example.com',
        })
      )

      // Update only city via URL params
      const newParams = new URLSearchParams('city=San+Diego&zip=92101')
      const newLocation = parseLocationFromParams(newParams)

      store.dispatch(setLocation(newLocation))
      store.dispatch(
        setForm({
          city: newLocation.city,
          zipCode: newLocation.zip,
        })
      )

      // Verify state
      const configState = store.getState().config
      const formState = store.getState().form

      expect(configState.location?.city).toBe('San Diego')
      expect(configState.location?.zip).toBe('92101')
      expect(formState.city).toBe('San Diego')
      expect(formState.zipCode).toBe('92101')

      // Other form fields should be preserved
      expect(formState.firstName).toBe('John')
      expect(formState.email).toBe('john@example.com')
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle rapid URL parameter changes', () => {
      const urlSequence = [
        'city=Los+Angeles&zip=90210',
        'city=San+Diego&zip=92101',
        'city=Playa+Vista&zip=90094',
        'city=Westchester&zip=90045',
      ]

      urlSequence.forEach((paramString) => {
        const params = new URLSearchParams(paramString)
        const location = parseLocationFromParams(params)

        store.dispatch(setLocation(location))
        store.dispatch(
          setForm({
            city: location.city,
            zipCode: location.zip,
          })
        )

        // Verify each update
        const state = store.getState()
        expect(state.config.location?.city).toBe(location.city)
        expect(state.config.location?.zip).toBe(location.zip)
        expect(state.form.city).toBe(location.city)
        expect(state.form.zipCode).toBe(location.zip)
      })
    })

    it('should handle empty parameters without breaking state', () => {
      // Set initial state
      store.dispatch(
        setLocation({
          street: '123 Main St',
          city: 'Los Angeles',
          zip: '90210',
        })
      )

      // Process empty parameters
      const emptyParams = new URLSearchParams('')
      const emptyLocation = parseLocationFromParams(emptyParams)

      // Should not dispatch if no location data
      if (emptyLocation.street || emptyLocation.city || emptyLocation.zip) {
        store.dispatch(setLocation(emptyLocation))
      }

      // State should remain unchanged
      const state = store.getState()
      expect(state.config.location?.city).toBe('Los Angeles')
      expect(state.config.location?.zip).toBe('90210')
    })
  })
})
