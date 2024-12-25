import React from "react"

import ClientPage from "./ClientPage"
import { applyReferral } from "@/lib/posthog/applyReferral"

export default async function Page({
  searchParams,
}: {
  searchParams: URLSearchParams
}) {
  applyReferral({ searchParams })
  return <ClientPage />
}
