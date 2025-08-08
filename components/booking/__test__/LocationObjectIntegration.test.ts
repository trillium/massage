import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'
import React from 'react'

import configReducer, {
  setLocation,
  setBulkConfigSliceState,
  initialState as configInitialState,
} from '@/redux/slices/configSlice'
import formReducer, { setForm, initialBookingFormData } from '@/redux/slices/formSlice'
import { resolveConfiguration } from '@/lib/slugConfigurations/helpers/resolveConfiguration'
import { LocationObject } from '@/lib/types'

// Mock store setup
const createMockStore = () => {
  return configureStore({
    reducer: {
      config: configReducer,
      form: formReducer,
    },
  })
}

describe('Location Object Integration Tests', () => {
  let store: ReturnType<typeof createMockStore>

  beforeEach(() => {
    store = createMockStore()
  })

  describe('Redux Config Slice Location Handling', () => {
    it('should set location object in config slice', () => {
      const testLocation: LocationObject = {
        street: 'Hotel June West LA, 8639 Lincoln Blvd',
        city: 'Los Angeles',
        zip: '90045',
      }

      store.dispatch(setLocation(testLocation))

      const state = store.getState()
      expect(state.config.location).toEqual(testLocation)
    })

    it('should handle null location in config slice', () => {
      store.dispatch(setLocation(null))

      const state = store.getState()
      expect(state.config.location).toBeNull()
    })

    it('should update location via bulk config update', () => {
      const testLocation: LocationObject = {
        street: '123 Test Street',
        city: 'Test City',
        zip: '12345',
      }

      store.dispatch(
        setBulkConfigSliceState({
          location: testLocation,
          title: 'Test Booking Page',
        })
      )

      const state = store.getState()
      expect(state.config.location).toEqual(testLocation)
      expect(state.config.title).toBe('Test Booking Page')
    })
  })

  describe('Redux Form Slice Location Handling', () => {
    it('should set location object in form slice', () => {
      const testLocation: LocationObject = {
        street: '456 Form Street',
        city: 'Form City',
        zip: '67890',
      }

      store.dispatch(setForm({ location: testLocation }))

      const state = store.getState()
      expect(state.form.location).toEqual(testLocation)
    })

    it('should preserve other form fields when updating location', () => {
      // Set initial form data
      store.dispatch(
        setForm({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        })
      )

      const testLocation: LocationObject = {
        street: '789 Update Street',
        city: 'Update City',
        zip: '13579',
      }

      // Update location
      store.dispatch(setForm({ location: testLocation }))

      const state = store.getState()
      expect(state.form.location).toEqual(testLocation)
      expect(state.form.firstName).toBe('John')
      expect(state.form.lastName).toBe('Doe')
      expect(state.form.email).toBe('john@example.com')
    })
  })

  describe('Slug Configuration Integration', () => {
    it('should resolve hotel-june configuration with correct location', async () => {
      const configuration = await resolveConfiguration('hotel-june')

      expect(configuration).toBeDefined()
      expect(configuration.bookingSlug).toEqual(['hotel-june'])
      expect(configuration.type).toBe('fixed-location')
      expect(configuration.title).toBe('Book an in-room massage at Hotel June!')
      expect(configuration.locationIsReadOnly).toBe(true)

      // Check the location object structure
      expect(configuration.location).toEqual({
        street: 'Hotel June West LA, 8639 Lincoln Blvd',
        city: 'Los Angeles',
        zip: '90045',
      })
    })

    it('should resolve playa-vista configuration without location', async () => {
      const configuration = await resolveConfiguration('playa-vista')

      // This should have no location since it's not explicitly set in config
      expect(configuration.location).toBeNull()
    })

    it('should resolve westchester slug configuration', async () => {
      const configuration = await resolveConfiguration('westchester')

      // Should be part of the multi-slug config for nearby areas
      expect(configuration.bookingSlug).toEqual([
        '90045',
        'westchester',
        'playa',
        'playa-vista',
        'kentwood',
      ])
      expect(configuration.type).toBe('area-wide')
      expect(configuration.leadTimeMinimum).toBe(60)

      // Location should be null since it's not explicitly set in config
      expect(configuration.location).toBeNull()
    })
  })

  describe('End-to-End Location Flow Integration', () => {
    it('should populate both config and form with location from hotel-june slug', async () => {
      // Step 1: Resolve configuration from slug
      const configuration = await resolveConfiguration('hotel-june')

      // Step 2: Apply configuration to Redux config slice
      store.dispatch(setBulkConfigSliceState(configuration))

      // Step 3: Populate form with location from config
      if (configuration.location) {
        store.dispatch(setForm({ location: configuration.location }))
      }

      // Step 4: Verify both config and form have correct location
      const state = store.getState()

      const expectedLocation: LocationObject = {
        street: 'Hotel June West LA, 8639 Lincoln Blvd',
        city: 'Los Angeles',
        zip: '90045',
      }

      expect(state.config.location).toEqual(expectedLocation)
      expect(state.form.location).toEqual(expectedLocation)
      expect(state.config.locationIsReadOnly).toBe(true)
      expect(state.config.type).toBe('fixed-location')
    })

    it('should populate both config and form with location from area slug', async () => {
      // Step 1: Resolve configuration from area slug
      const configuration = await resolveConfiguration('playa-vista')

      // Step 2: Apply configuration to Redux config slice
      store.dispatch(setBulkConfigSliceState(configuration))

      // Step 3: No location to populate since playa-vista config doesn't have one
      // Step 4: Verify config has no location (since it's not explicitly set)
      const state = store.getState()

      expect(state.config.location).toBeNull()
      expect(state.form.location).toEqual({ street: '', city: '', zip: '' })
      expect(state.config.type).toBe('area-wide')
      expect(state.config.leadTimeMinimum).toBe(60)
    })

    it('should handle multiple slug resolution and maintain consistency', async () => {
      const testSlugs = ['hotel-june', 'westchester', 'playa-vista']

      for (const slug of testSlugs) {
        // Create fresh store for each test
        const testStore = createMockStore()

        // Resolve configuration
        const configuration = await resolveConfiguration(slug)

        // Apply to Redux
        testStore.dispatch(setBulkConfigSliceState(configuration))
        if (configuration.location) {
          testStore.dispatch(setForm({ location: configuration.location }))
        }

        const state = testStore.getState()

        // Verify consistency between config and form
        // Note: config.location can be null, form.location can be undefined if not set
        if (configuration.location) {
          expect(state.config.location).toEqual(state.form.location)
        } else {
          expect(state.config.location).toBeNull()
          expect(state.form.location).toEqual({ street: '', city: '', zip: '' })
        }

        // Verify location structure if present (only hotel-june should have location)
        if (state.config.location) {
          expect(state.config.location).toHaveProperty('street')
          expect(state.config.location).toHaveProperty('city')
          expect(state.config.location).toHaveProperty('zip')
          expect(typeof state.config.location.street).toBe('string')
          expect(typeof state.config.location.city).toBe('string')
          expect(typeof state.config.location.zip).toBe('string')
        }
      }
    })
  })

  describe('Location Object Validation', () => {
    it('should maintain location object structure integrity', () => {
      const validLocation: LocationObject = {
        street: 'Test Street',
        city: 'Test City',
        zip: '12345',
      }

      // Test config slice
      store.dispatch(setLocation(validLocation))
      let state = store.getState()
      expect(state.config.location).toEqual(validLocation)

      // Test form slice
      store.dispatch(setForm({ location: validLocation }))
      state = store.getState()
      expect(state.form.location).toEqual(validLocation)

      // Verify no extra properties
      expect(Object.keys(state.config.location!)).toEqual(['street', 'city', 'zip'])
      expect(Object.keys(state.form.location!)).toEqual(['street', 'city', 'zip'])
    })

    it('should handle empty location fields gracefully', () => {
      const emptyLocation: LocationObject = {
        street: '',
        city: '',
        zip: '',
      }

      store.dispatch(setLocation(emptyLocation))
      store.dispatch(setForm({ location: emptyLocation }))

      const state = store.getState()
      expect(state.config.location).toEqual(emptyLocation)
      expect(state.form.location).toEqual(emptyLocation)
    })
  })
})
