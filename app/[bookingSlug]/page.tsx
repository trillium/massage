import siteMetadata from '@/data/siteMetadata'
import ClientPage from './ClientPage'
import { fetchContainersByQuery } from '@/lib/fetch/fetchContainersByQuery'

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<URLSearchParams>
  params: Promise<{ bookingSlug: string }>
}) {
  const { bookingSlug } = await params
  const resolvedParams = await searchParams
  const { props } = await fetchContainersByQuery({
    searchParams: resolvedParams,
    query: bookingSlug,
  })

  const containerStrings = {
    eventBaseString: bookingSlug + siteMetadata.eventBaseString,
    eventMemberString: bookingSlug + siteMetadata.eventBaseString + 'MEMBER__',
    eventContainerString: bookingSlug + siteMetadata.eventBaseString + 'CONTAINER__',
  }
  return <ClientPage {...props} {...containerStrings} />
}
