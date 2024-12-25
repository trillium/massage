import React from "react"
import { Public_Sans } from "next/font/google"
import { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"

import { ThemeProviders } from "@/app/ThemeProviders"

import "@/styles/global.css"
import ThemeSwitch from "@/components/ThemeSwitch"

import siteMetadata from "@/data/siteMetadata"
import { NavOptions } from "@/components/NavOptions"
import SectionContainer from "@/components/SectionContainer"
import Link from "next/link"
import Logo from "@/components/Logo"
import StoreProvider from "@/app/StoreProvider"

const public_sans = Public_Sans({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: siteMetadata.title,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: "./",
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "./",
    types: {
      "application/rss+xml": `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: "summary_large_image",
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
      <html
        lang="en"
        className={public_sans.className}
        suppressHydrationWarning>
        <link rel="icon" type="image/svg+xml" href={"/logo_svg.svg"} />
        <body className="bg-white min-h-screen pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-white">
          <ThemeProviders>
            <SectionContainer>
              <header className="relative flex items-center justify-between px-4 py-10 sm:px-0">
                <div className="align-center flex flex-row items-center">
                  <Link href="/" aria-label={siteMetadata.headerTitle}>
                    <div className="flex items-center justify-between">
                      <div className="mr-2 flex items-center">
                        <Logo classes="text-primary-500 w-10 h-10 xs:w-12 xs:h-12" />
                      </div>
                      {typeof siteMetadata.headerTitle === "string" ? (
                        <div className="hidden h-6 text-2xl font-semibold sm:block">
                          {siteMetadata.headerTitle}
                        </div>
                      ) : (
                        siteMetadata.headerTitle
                      )}
                    </div>
                  </Link>
                </div>
                <nav className="flex items-center space-x-3 xs:space-x-4 leading-5 sm:space-x-6">
                  <NavOptions />
                  <ThemeSwitch />
                </nav>
              </header>
              {children}
            </SectionContainer>
            <Analytics />
          </ThemeProviders>
        </body>
      </html>
    </StoreProvider>
  )
}
