import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import ClientPage from './ClientPage'
import Main from './Main'

export default async function Page({ searchParams }: { searchParams: Promise<URLSearchParams> }) {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const resolvedParams = await searchParams
  const { props } = await fetchData({ searchParams: resolvedParams })
  return (
    <>
      <Template title="Book a session with Trillium :)" />
      <ClientPage {...props} />
      <Main posts={posts} />
    </>
  )
}
