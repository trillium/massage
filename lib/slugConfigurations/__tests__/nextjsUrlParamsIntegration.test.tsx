import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { useEffect } from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import configReducer, { setLocation } from '@/redux/slices/configSlice'
import formReducer, { setForm } from '@/redux/slices/formSlice'
import { parseLocationFromParams } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import type { RootState } from '@/redux/store'

// Mock the Next.js navigation hook with proper typing
const mockSearchParams = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams(),
}))

// Create test store
const createTestStore = () =>
  configureStore({
    reducer: {
      config: configReducer,
      form: formReducer,
    },
  })

// Helper to create mock search params that work with our parsing function
const createMockSearchParams = (query: string) => {
  const params = new URLSearchParams(query)
  return {
    get: (name: string) => params.get(name),
    toString: () => params.toString(),
    // Add other methods as needed for the interface
    has: (name: string) => params.has(name),
    getAll: (name: string) => params.getAll(name),
    keys: () => params.keys(),
    values: () => params.values(),
    entries: () => params.entries(),
    forEach: (callback: (value: string, key: string) => void) => params.forEach(callback),
    size: params.size,
    [Symbol.iterator]: () => params[Symbol.iterator](),
  }
}

// Component that simulates real-world Next.js URL params consumption
const NextJSURLConsumer: React.FC = () => {
  const searchParams = mockSearchParams()
  const [locationData, setLocationData] = React.useState<string>('')

  useEffect(() => {
    if (searchParams) {
      const urlSearchParams = new URLSearchParams(searchParams.toString())
      const location = parseLocationFromParams(urlSearchParams)
      setLocationData(JSON.stringify(location))
    }
  }, [searchParams])

  return (
    <div>
      <div data-testid="parsed-location">{locationData}</div>
      <div data-testid="search-params-string">{searchParams?.toString()}</div>
    </div>
  )
}

// Component that integrates URL params with Redux
const URLToReduxBridge: React.FC = () => {
  const searchParams = mockSearchParams()
  const [reduxStore, setReduxStore] = React.useState<ReturnType<typeof createTestStore> | null>(
    null
  )

  useEffect(() => {
    const store = createTestStore()
    setReduxStore(store)
  }, [])

  useEffect(() => {
    if (searchParams && reduxStore) {
      const urlSearchParams = new URLSearchParams(searchParams.toString())
      const location = parseLocationFromParams(urlSearchParams)

      // Dispatch to Redux store
      if (location.street || location.city || location.zip) {
        reduxStore.dispatch(setLocation(location))
      }

      // Update form data with location object
      if (location.street || location.city || location.zip) {
        reduxStore.dispatch(setForm({ location }))
      }
    }
  }, [searchParams, reduxStore])

  if (!reduxStore) return <div>Loading...</div>

  return (
    <Provider store={reduxStore}>
      <ReduxStateDisplay />
    </Provider>
  )
}

// Component to display Redux state
const ReduxStateDisplay: React.FC = () => {
  const location = useSelector((state: RootState) => state.config.location)
  const form = useSelector((state: RootState) => state.form)

  return (
    <div>
      <div data-testid="redux-location">{JSON.stringify(location)}</div>
      <div data-testid="redux-form-city">{form.location?.city}</div>
      <div data-testid="redux-form-zip">{form.location?.zip}</div>
    </div>
  )
}

describe('Next.js URL Search Params Integration', () => {
  beforeEach(() => {
    mockSearchParams.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('URL Parameter Parsing with Next.js useSearchParams', () => {
    it('should parse location parameters from Next.js useSearchParams', () => {
      const mockParams = createMockSearchParams('street=123+Main+St&city=Los+Angeles&zip=90210')
      mockSearchParams.mockReturnValue(mockParams)

      render(<NextJSURLConsumer />)

      const parsedLocation = screen.getByTestId('parsed-location')
      expect(parsedLocation).toHaveTextContent(
        JSON.stringify({
          street: '123 Main St',
          city: 'Los Angeles',
          zip: '90210',
        })
      )
    })

    it('should handle empty search params', () => {
      const mockParams = createMockSearchParams('')
      mockSearchParams.mockReturnValue(mockParams)

      render(<NextJSURLConsumer />)

      const parsedLocation = screen.getByTestId('parsed-location')
      expect(parsedLocation).toHaveTextContent(
        JSON.stringify({
          street: '',
          city: '',
          zip: '',
        })
      )
    })

    it('should handle null search params', () => {
      mockSearchParams.mockReturnValue(null)

      render(<NextJSURLConsumer />)

      const parsedLocation = screen.getByTestId('parsed-location')
      expect(parsedLocation).toHaveTextContent('')
    })
  })

  describe('URL Parameters to Redux Integration with Next.js', () => {
    it('should integrate URL params with Redux store', async () => {
      const mockParams = createMockSearchParams('city=Playa+Vista&zip=90094')
      mockSearchParams.mockReturnValue(mockParams)

      render(<URLToReduxBridge />)

      // Wait for Redux state to be updated
      await vi.waitFor(() => {
        const reduxLocation = screen.getByTestId('redux-location')
        expect(reduxLocation).toHaveTextContent(
          JSON.stringify({
            street: '',
            city: 'Playa Vista',
            zip: '90094',
          })
        )
      })

      const reduxFormCity = screen.getByTestId('redux-form-city')
      const reduxFormZip = screen.getByTestId('redux-form-zip')

      expect(reduxFormCity).toHaveTextContent('Playa Vista')
      expect(reduxFormZip).toHaveTextContent('90094')
    })

    it('should handle complete location data from URL', async () => {
      const mockParams = createMockSearchParams('street=456+Ocean+Ave&city=Westchester&zip=90045')
      mockSearchParams.mockReturnValue(mockParams)

      render(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxLocation = screen.getByTestId('redux-location')
        expect(reduxLocation).toHaveTextContent(
          JSON.stringify({
            street: '456 Ocean Ave',
            city: 'Westchester',
            zip: '90045',
          })
        )
      })
    })

    it('should handle URL parameter updates', async () => {
      // Start with initial params
      const initialParams = createMockSearchParams('city=Los+Angeles&zip=90210')
      mockSearchParams.mockReturnValue(initialParams)

      const { rerender } = render(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxFormCity = screen.getByTestId('redux-form-city')
        expect(reduxFormCity).toHaveTextContent('Los Angeles')
      })

      // Update params
      const updatedParams = createMockSearchParams('city=San+Diego&zip=92101')
      mockSearchParams.mockReturnValue(updatedParams)

      rerender(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxFormCity = screen.getByTestId('redux-form-city')
        const reduxFormZip = screen.getByTestId('redux-form-zip')
        expect(reduxFormCity).toHaveTextContent('San Diego')
        expect(reduxFormZip).toHaveTextContent('92101')
      })
    })
  })

  describe('Slug-based Location Configuration Tests', () => {
    it('should handle Playa Vista slug configuration', async () => {
      const mockParams = createMockSearchParams('city=Playa+Vista&zip=90094')
      mockSearchParams.mockReturnValue(mockParams)

      render(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxFormCity = screen.getByTestId('redux-form-city')
        const reduxFormZip = screen.getByTestId('redux-form-zip')
        expect(reduxFormCity).toHaveTextContent('Playa Vista')
        expect(reduxFormZip).toHaveTextContent('90094')
      })
    })

    it('should handle Kentwood slug configuration', async () => {
      const mockParams = createMockSearchParams('city=Kentwood&zip=90045')
      mockSearchParams.mockReturnValue(mockParams)

      render(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxFormCity = screen.getByTestId('redux-form-city')
        const reduxFormZip = screen.getByTestId('redux-form-zip')
        expect(reduxFormCity).toHaveTextContent('Kentwood')
        expect(reduxFormZip).toHaveTextContent('90045')
      })
    })

    it('should handle Playa del Rey slug configuration', async () => {
      const mockParams = createMockSearchParams('city=Playa+del+Rey&zip=90293')
      mockSearchParams.mockReturnValue(mockParams)

      render(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxFormCity = screen.getByTestId('redux-form-city')
        const reduxFormZip = screen.getByTestId('redux-form-zip')
        expect(reduxFormCity).toHaveTextContent('Playa del Rey')
        expect(reduxFormZip).toHaveTextContent('90293')
      })
    })

    it('should handle San Diego slug configuration', async () => {
      const mockParams = createMockSearchParams('city=San+Diego&zip=92101')
      mockSearchParams.mockReturnValue(mockParams)

      render(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxFormCity = screen.getByTestId('redux-form-city')
        const reduxFormZip = screen.getByTestId('redux-form-zip')
        expect(reduxFormCity).toHaveTextContent('San Diego')
        expect(reduxFormZip).toHaveTextContent('92101')
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed URL parameters', async () => {
      const mockParams = createMockSearchParams('city=%20&zip=invalid&street=')
      mockSearchParams.mockReturnValue(mockParams)

      render(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxLocation = screen.getByTestId('redux-location')
        expect(reduxLocation).toHaveTextContent(
          JSON.stringify({
            street: '',
            city: ' ', // Decoded space
            zip: 'invalid',
          })
        )
      })
    })

    it('should not update Redux when no location params are present', async () => {
      const mockParams = createMockSearchParams('other=value&another=param')
      mockSearchParams.mockReturnValue(mockParams)

      render(<URLToReduxBridge />)

      await vi.waitFor(() => {
        const reduxLocation = screen.getByTestId('redux-location')
        expect(reduxLocation).toHaveTextContent('null')
      })

      const reduxFormCity = screen.getByTestId('redux-form-city')
      const reduxFormZip = screen.getByTestId('redux-form-zip')
      expect(reduxFormCity).toHaveTextContent('')
      expect(reduxFormZip).toHaveTextContent('')
    })
  })
})
