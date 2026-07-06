'use client'

import { CSPostHogProvider } from 'context/AnalyticsContext'
import { PostHogErrorBoundary } from 'posthog-js/react'
import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'
import StoreProvider from 'app/StoreProvider'
import { AuthStateListener } from './components/AuthStateListener'
import LocationParamSync from '@/components/utilities/LocationParamSync'
import RefTracker from '@/components/utilities/RefTracker'
import FormPersistenceManager from '@/components/utilities/FormPersistenceManager'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <CSPostHogProvider>
      <PostHogErrorBoundary>
        <AuthStateListener />
        <StoreProvider>
          <LocationParamSync />
          <RefTracker />
          <FormPersistenceManager />
          <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme} enableSystem>
            {children}
          </ThemeProvider>
        </StoreProvider>
      </PostHogErrorBoundary>
    </CSPostHogProvider>
  )
}
