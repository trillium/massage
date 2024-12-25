"use client"

import { CSPostHogProvider } from "@/context/AnalyticsContext"
import { ThemeProvider } from "next-themes"

const theme = "system"

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <CSPostHogProvider>
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem>
        {children}
      </ThemeProvider>
    </CSPostHogProvider>
  )
}
