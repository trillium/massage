import type { InferGetServerSidePropsType } from 'next'

import ClientPage from './ClientPage'
import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import { SearchParamsType } from '@/lib/types'

export type PageProps = InferGetServerSidePropsType<typeof fetchData>

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<SearchParamsType> }) {
  const resolvedParams = await searchParams
  const { props } = await fetchData({ searchParams: resolvedParams })
  return (
    <main>
      <Template title="Book a session with Trillium :)" />
      <ClientPage {...props} />
    </main>
  )
}
