'use client'

import { CSPostHogProvider } from 'context/AnalyticsContext'
import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'
import StoreProvider from 'app/StoreProvider'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <CSPostHogProvider>
      <StoreProvider>
        <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme} enableSystem>
          {children}
        </ThemeProvider>
      </StoreProvider>
    </CSPostHogProvider>
  )
}
