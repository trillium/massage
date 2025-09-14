import React from 'react'

import ClientPage from './ClientPage'
import SectionContainer from '@/components/SectionContainer'
import { BookedDataSchema } from '@/lib/schema'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ url: string; data: string; email?: string; token?: string }>
}) {
  const params = await searchParams
  const { url, data: dataRaw, email, token } = params

  const parsedData = JSON.parse(dataRaw)

  // Validate the booked data structure
  const validationResult = BookedDataSchema.safeParse(parsedData)

  if (!validationResult.success) {
    console.error('Invalid booked data structure:', validationResult.error)
    // Return error page or fallback
    return (
      <SectionContainer>
        <div className="mx-auto max-w-xl py-8 sm:py-16">
          <h1 className="text-3xl font-bold text-red-600">Error</h1>
          <p className="mt-4 text-gray-600">Invalid appointment data. Please try again.</p>
        </div>
      </SectionContainer>
    )
  }

  const data = validationResult.data

  return (
    <SectionContainer>
      <ClientPage url={url} data={data} />
    </SectionContainer>
  )
}
