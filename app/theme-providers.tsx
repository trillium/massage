'use client'

import { CSPostHogProvider } from 'context/AnalyticsContext'
import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'
import StoreProvider from 'app/StoreProvider'
import { AuthStateListener } from './components/AuthStateListener'
import LocationParamSync from '@/components/utilities/LocationParamSync'
import FormPersistenceManager from '@/components/utilities/FormPersistenceManager'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <CSPostHogProvider>
      <AuthStateListener />
      <StoreProvider>
        <LocationParamSync />
        <FormPersistenceManager />
        <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme} enableSystem>
          {children}
        </ThemeProvider>
      </StoreProvider>
    </CSPostHogProvider>
  )
}
