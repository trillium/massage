'use client'

import { CSPostHogProvider } from 'context/AnalyticsContext'
import { ThemeProvider } from 'next-themes'
import StoreProvider from 'app/StoreProvider'

const theme = 'system'

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <CSPostHogProvider>
      <StoreProvider>
        <ThemeProvider attribute="class" defaultTheme={theme} enableSystem>
          {children}
        </ThemeProvider>
      </StoreProvider>
    </CSPostHogProvider>
  )
}
