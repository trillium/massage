import React from 'react'

import ClientPage from './ClientPage'
import SectionContainer from '@/components/SectionContainer'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ url: string; data: string }>
}) {
  const params = await searchParams
  const { url, data: dataRaw } = params

  const data = JSON.parse(dataRaw)

  return (
    <SectionContainer>
      <ClientPage url={url} data={data} />
    </SectionContainer>
  )
}
