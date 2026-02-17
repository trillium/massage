import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import configReducer, { setLocation } from '@/redux/slices/configSlice'
import formReducer, { setForm } from '@/redux/slices/formSlice'
import { parseLocationFromParams } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import { LocationObject } from '@/lib/types'

// Create test store
const createTestStore = () =>
  configureStore({
    reducer: {
      config: configReducer,
      form: formReducer,
    },
  })

/**
 * Test suite to verify server configuration takes priority over URL parameters
 * in the URL parameter parsing and Redux state management system
 */
describe('URL Parameters vs Server Config Priority System', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Priority System Implementation', () => {
    it('should allow URL parameters to set location when no server config exists', () => {
      // Simulate URL parameters
      const urlParams = new URLSearchParams('street=123+URL+St&city=URL+City&zip=90210')
      const locationFromUrl = parseLocationFromParams(urlParams)

      // Apply URL parameters to Redux (as InitialUrlUtility would do)
      store.dispatch(setLocation(locationFromUrl))
      store.dispatch(setForm({ location: locationFromUrl }))

      const state = store.getState()
      expect(state.config.location).toEqual({
        street: '123 URL St',
        city: 'URL City',
        zip: '90210',
      })
      expect(state.form.location.city).toBe('URL City')
      expect(state.form.location.zip).toBe('90210')
    })

    it('should override URL parameters with server configuration (highest priority)', () => {
      // Step 1: First apply URL parameters (lower priority)
      const urlParams = new URLSearchParams('street=123+URL+St&city=URL+City&zip=90210')
      const locationFromUrl = parseLocationFromParams(urlParams)

      store.dispatch(setLocation(locationFromUrl))
      store.dispatch(setForm({ location: locationFromUrl }))

      // Verify URL params were applied
      let state = store.getState()
      expect(state.config.location?.city).toBe('URL City')
      expect(state.form.location.city).toBe('URL City')

      // Step 2: Apply server configuration (higher priority - should override)
      const serverLocation: LocationObject = {
        street: '456 Server Ave',
        city: 'Server City',
        zip: '90045',
      }

      store.dispatch(setLocation(serverLocation))
      store.dispatch(setForm({ location: serverLocation }))

      // Verify server config overrode URL params
      state = store.getState()
      expect(state.config.location).toEqual(serverLocation)
      expect(state.form.location).toEqual(serverLocation)

      // URL parameters should be completely overridden
      expect(state.config.location?.city).toBe('Server City')
      expect(state.config.location?.street).toBe('456 Server Ave')
      expect(state.config.location?.zip).toBe('90045')
    })

    it('should demonstrate complete priority override scenario', () => {
      // Scenario: User navigates to /playa-vista?street=123+Wrong+St&city=Wrong+City&zip=99999
      // But server config has specific location for playa-vista slug

      // URL parameters from query string
      const urlLocation: LocationObject = {
        street: '123 Wrong St',
        city: 'Wrong City',
        zip: '99999',
      }

      // Server configuration for playa-vista slug
      const serverLocation: LocationObject = {
        street: '8675 Playa Vista Dr',
        city: 'Playa Vista',
        zip: '90094',
      }

      // Simulate InitialUrlUtility Step 1: Apply URL params first
      store.dispatch(setLocation(urlLocation))
      store.dispatch(setForm({ location: urlLocation }))

      let state = store.getState()
      expect(state.config.location?.city).toBe('Wrong City') // Temporarily from URL

      // Simulate InitialUrlUtility Step 2: Server config overrides
      store.dispatch(setLocation(serverLocation))
      store.dispatch(setForm({ location: serverLocation }))

      // Final state should be entirely from server config
      state = store.getState()
      expect(state.config.location).toEqual(serverLocation)
      expect(state.form.location).toEqual(serverLocation)

      // No traces of URL parameters should remain
      expect(state.config.location?.city).toBe('Playa Vista')
      expect(state.config.location?.street).toBe('8675 Playa Vista Dr')
      expect(state.config.location?.zip).toBe('90094')
    })

    it('should handle mixed scenarios where server has partial config', () => {
      // URL parameters have full address
      const urlParams = new URLSearchParams('street=123+URL+St&city=URL+City&zip=90210')
      const locationFromUrl = parseLocationFromParams(urlParams)

      // Server only has city and zip, no street
      const serverLocation: LocationObject = {
        street: '',
        city: 'Server City',
        zip: '90045',
      }

      // Apply URL first, then server
      store.dispatch(setLocation(locationFromUrl))
      store.dispatch(setLocation(serverLocation)) // This completely replaces the location

      const state = store.getState()

      // Server config should completely replace URL config, even if some fields are empty
      expect(state.config.location).toEqual(serverLocation)
      expect(state.config.location?.street).toBe('') // Empty from server
      expect(state.config.location?.city).toBe('Server City') // From server
      expect(state.config.location?.zip).toBe('90045') // From server
    })
  })

  describe('Priority System Edge Cases', () => {
    it('should handle empty server location object', () => {
      const urlParams = new URLSearchParams('city=URL+City&zip=90210')
      const locationFromUrl = parseLocationFromParams(urlParams)

      const emptyServerLocation: LocationObject = {
        street: '',
        city: '',
        zip: '',
      }

      // Apply URL params first
      store.dispatch(setLocation(locationFromUrl))

      // Apply empty server location (should still override)
      store.dispatch(setLocation(emptyServerLocation))

      const state = store.getState()
      expect(state.config.location).toEqual(emptyServerLocation)
      expect(state.config.location?.city).toBe('') // Empty, not from URL
    })

    it('should handle null/undefined server location gracefully', () => {
      const urlParams = new URLSearchParams('city=URL+City&zip=90210')
      const locationFromUrl = parseLocationFromParams(urlParams)

      // Apply URL params
      store.dispatch(setLocation(locationFromUrl))

      let state = store.getState()
      expect(state.config.location?.city).toBe('URL City')

      // Apply null server location
      store.dispatch(setLocation(null))

      state = store.getState()
      expect(state.config.location).toBeNull()
    })
  })
})
