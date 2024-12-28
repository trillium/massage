import type { InferGetServerSidePropsType } from 'next'

import ClientPage from './ClientPage'
import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import { applyReferral } from 'lib/posthog/applyReferral'

export type PageProps = InferGetServerSidePropsType<typeof fetchData>

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: URLSearchParams }) {
  const resolvedParams = await searchParams
  const { props } = await fetchData({ searchParams: resolvedParams })
  applyReferral({ searchParams })
  return (
    <main className="mx-4 max-w-2xl pb-24 sm:mx-auto">
      <Template title="Book a session with Trillium :)" />
      <ClientPage {...props} />
    </main>
  )
}
