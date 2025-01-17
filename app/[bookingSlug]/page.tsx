import siteMetadata from '@/data/siteMetadata'
import ClientPage from './ClientPage'
import { fetchContainersByQuery } from '@/lib/fetch/fetchContainersByQuery'
// import { applyReferral } from "@/lib/posthog/applyReferral"

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: URLSearchParams
  params: { bookingSlug: string }
}) {
  const { bookingSlug } = params
  const { props } = await fetchContainersByQuery({
    searchParams,
    query: bookingSlug,
  })

  const containerStrings = {
    eventBaseString: bookingSlug + siteMetadata.eventBaseString,
    eventMemberString: bookingSlug + siteMetadata.eventBaseString + 'MEMBER__',
    eventContainerString: bookingSlug + siteMetadata.eventBaseString + 'CONTAINER__',
  }
  // applyReferral({ searchParams })
  return <ClientPage {...props} {...containerStrings} />
}
