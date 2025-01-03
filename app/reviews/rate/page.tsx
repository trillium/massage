import React from 'react'
import ClientPage from './ClientPage'
import { decode } from 'lib/hashServer'

export default async function Page({ searchParams }: { searchParams: Promise<URLSearchParams> }) {
  const resolvedParams = await searchParams
  const { validated, data } = await decode(resolvedParams)
  const { date, start, end, firstName, lastName } = data

  return <ClientPage {...{ validated, date, start, end, firstName, lastName, ...data }} />
}
