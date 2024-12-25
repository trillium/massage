import React from "react"
import ClientPage from "./ClientPage"
import { decode } from "@/lib/hashServer"

export default async function Page({ searchParams }: { searchParams: Object }) {
  const { validated, data } = await decode(searchParams)
  const { date, start, end, firstName, lastName } = data

  return (
    <ClientPage
      {...{ validated, date, start, end, firstName, lastName, ...data }}
    />
  )
}
