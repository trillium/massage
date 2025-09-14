import '@testing-library/jest-dom'
import { beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Make React available globally for JSX
global.React = React

// Mock fetch globally
global.fetch = vi.fn()

// Mock pliny dependencies globally
vi.mock('pliny/analytics', () => ({
  Analytics: () => null,
}))

vi.mock('pliny/search', () => ({
  SearchProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

// Mock environment variables for tests
process.env.GOOGLE_OAUTH_SECRET = 'test_oauth_secret'
process.env.GOOGLE_OAUTH_REFRESH = 'test_oauth_refresh'
process.env.GOOGLE_OAUTH_CLIENT_ID = 'test_client_id'

// Global test setup
beforeEach(() => {
  // Reset all mocks between tests
  vi.clearAllMocks()

  // Set up default fetch mock for Google OAuth and Calendar APIs
  vi.mocked(global.fetch).mockImplementation(async (url: string | URL | Request) => {
    const urlString = typeof url === 'string' ? url : url.toString()

    if (urlString.includes('oauth2.googleapis.com/token')) {
      return {
        ok: true,
        json: async () => ({
          access_token: 'mock_access_token',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      } as Response
    }

    if (urlString.includes('calendar.google.com/calendar/v3')) {
      return {
        ok: true,
        json: async () => ({
          items: [],
          nextPageToken: null,
        }),
      } as Response
    }

    // Default mock response for other fetch calls
    return {
      ok: true,
      json: async () => ({ success: true }),
    } as Response
  })

  // Mock console to reduce test noise
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
