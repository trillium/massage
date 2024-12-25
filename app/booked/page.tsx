import React from "react"

import ClientPage from "./ClientPage"

export default async function Page({ searchParams }: {
  searchParams: { url: string; data: string }
}) {

  const { url } = searchParams
  const data = JSON.parse(searchParams.data)

  return <ClientPage url={url} data={data} />
}
