import Template from '@/components/Template'
import Link from '@/components/Link'
import { FaClock } from 'react-icons/fa'
import { siteConfig } from '@/lib/siteConfig'
import promo from '@/data/promo.json'
import { H1 } from '@/components/ui/heading'
import { TextLgMuted } from '@/components/ui/text'

interface ExpiredPromoPageProps {
  title: string
  promoEndDate: string
  originalText?: string | string[] | null
}

export default function ExpiredPromoPage({
  title,
  promoEndDate,
  originalText,
}: ExpiredPromoPageProps) {
  const endDate = new Date(promoEndDate)
  const formattedDate = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col items-center justify-center bg-surface-100 py-4 dark:bg-surface-900">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <FaClock className="text-4xl" />
          </div>

          <H1 className="mb-4 dark:text-white">
            {promo.expiredPromo.heading}
          </H1>

          <Template title={title} text={`This offer expired on ${formattedDate}.`} />
        </div>

        <div className="space-y-4">
          <TextLgMuted>
            {promo.expiredPromo.reassurancePrefix} {siteConfig.business.serviceNoun}
            {promo.expiredPromo.reassuranceSuffix}
          </TextLgMuted>

          <div className="flex flex-col items-center space-y-3 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <Link
              href="/book"
              className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md px-6 py-3 text-base font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              {promo.expiredPromo.bookButtonText}
            </Link>

            <Link
              href="/"
              className="focus:ring-primary-500 inline-flex items-center rounded-md border border-accent-300 bg-surface-50 px-6 py-3 text-base font-medium text-accent-700 shadow-sm hover:bg-surface-100 focus:ring-2 focus:ring-offset-2 focus:outline-none dark:border-accent-600 dark:bg-surface-800 dark:text-accent-300 dark:hover:bg-surface-700"
            >
              {promo.expiredPromo.homeButtonText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
