import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import ClientPage from '../ClientPage'
import Main from '../Main'
import Hero from '@/components/hero/Hero'
import siteMetadata from 'storage/siteMetadata'
import Masonry from '@/components/masonry/Masonry'

const { avatar } = siteMetadata
const massageBio =
  'Trillium is a massage therapist with 10 years of experience. Working in the LA Metro Area, Trillium found success in specializing in In-Home mobile massage therapy, working solo and through platforms like Soothe and Zeel since 2016.'

export default async function Page({ searchParams }: { searchParams: Promise<URLSearchParams> }) {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const resolvedParams = await searchParams
  const { props } = await fetchData({ searchParams: resolvedParams })
  return (
    <>
      <div className="mb-10 flex flex-col items-center justify-center rounded-lg border-2 border-primary-500 p-5 text-2xl font-bold text-red-500">
        <p>Note, looking to rebuild this here:</p>
        <div>
          <a
            className="text-blue-500 underline"
            href="https://flowbite.com/docs/components/gallery/"
          >
            Flowbite Gallery Component
          </a>
        </div>
      </div>
      <Hero title="Meet Trillium - Certified Massge Therapist" img={avatar} text={massageBio} />
      <Masonry />
      <ClientPage {...props} />
      {!!posts.length && <Main posts={posts} />}
    </>
  )
}
