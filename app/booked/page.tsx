import React from 'react'

import ClientPage from './ClientPage'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{url: string; data: string}>
}) {
  const params = await searchParams
  const {url, data: dataRaw} = params

  const data = JSON.parse(dataRaw)

  return <ClientPage url={url} data={data} />
}
