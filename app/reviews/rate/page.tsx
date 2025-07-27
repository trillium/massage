import React from 'react'
import ClientPage from './ClientPage'
import { decode } from 'lib/hashServer'

export default async function Page({ searchParams }: { searchParams: Promise<URLSearchParams> }) {
  const resolvedParams = await searchParams
  // Convert URLSearchParams to plain object for decode function
  const paramsObject: { [key: string]: string } = {}
  resolvedParams.forEach((value, key) => {
    paramsObject[key] = value
  })

  const { validated, data } = await decode(paramsObject)
  const { date, start, end, firstName, lastName } = data

  const clientPageProps = {
    validated,
    date: date as string,
    start: start as string,
    end: end as string,
    firstName: firstName as string,
    lastName: lastName as string,
    ...data,
  }

  return <ClientPage {...clientPageProps} />
}
