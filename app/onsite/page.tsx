import type { InferGetServerSidePropsType } from "next"

import ClientPage from "./ClientPage"
import Template from "@/components/Template"
import { fetchData } from "@/lib/fetch/fetchData"
import { applyReferral } from "@/lib/posthog/applyReferral"

export type PageProps = InferGetServerSidePropsType<typeof fetchData>

export const dynamic = "force-dynamic"

export default async function Page({
  searchParams,
}: {
  searchParams: URLSearchParams
}) {
  const { props } = await fetchData({ searchParams })
  applyReferral({ searchParams })
  return (
    <main className="max-w-2xl sm:mx-auto mx-4 pb-24">
      <Template title="Schedule on-site chair massage :)" />
      <ClientPage {...props} />
    </main>
  )
}