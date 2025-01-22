import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Template from '@/components/Template'
import { fetchData } from 'lib/fetch/fetchData'
import ClientPage from './ClientPage'
import Main from './Main'
import Hero from '@/components/hero/Hero'
import siteMetadata from 'storage/siteMetadata'
import Masonry from '@/components/masonry/Masonry'

const { avatar } = siteMetadata
const mapData = '/static/images/foo/service-area.jpg'
const massageBio =
  'Trillium is a massage therapist with 10 years of experience. Working in the LA Metro Area, Trillium found success in specializing in In-Home mobile massage therapy, working solo and through platforms like Soothe and Zeel since 2016.'
const serviceAreaBlub =
  'Trillium is based out of Westchester, but happy to travel to the LA area in general. Very close locations include Playa Vista, Mar Vista, Santa Monica, Venice, El Segundo, and Torrance.'

export default async function Page({ searchParams }: { searchParams: Promise<URLSearchParams> }) {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const resolvedParams = await searchParams
  const { props } = await fetchData({ searchParams: resolvedParams })
  return (
    <>
      <Hero
        title="Meet Trillium - Certified Massge Therapist"
        img={avatar}
        text={massageBio}
        imageRight
      />
      <Hero
        title="What's the service area for mobile massage therapy?"
        img={mapData}
        text={serviceAreaBlub}
        buttons={false}
        imageLeft
      />
      <Template title="Book a massage with Trillium :)" />
      <ClientPage {...props} />
      {!!posts.length && <Main posts={posts} />}
    </>
  )
}
