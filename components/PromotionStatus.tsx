'use client'

import Link from 'next/link'
import { getActivePromotions, isPromotionActive } from '@/data/promotions'

interface PromotionStatusProps {
  endDate: string
  contactFormSubject?: string
}

export default function PromotionStatus({
  endDate,
  contactFormSubject = 'Keep me informed on Airbnb promos',
}: PromotionStatusProps) {
  const isExpired = !isPromotionActive(endDate)
  const activePromotions = getActivePromotions()

  if (!isExpired) {
    return null
  }

  const hasOtherActivePromotions = activePromotions.length > 0

  return (
    <div className="my-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/20">
      <p className="text-base text-gray-800 dark:text-gray-200">
        <strong>Note:</strong> This promotion has expired. Want to be notified about future
        promotions?{' '}
        <Link
          href={`/contact?subject=${encodeURIComponent(contactFormSubject)}`}
          className="font-medium text-primary-600 underline hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Fill out this contact form
        </Link>{' '}
        and we'll let you know!
      </p>

      {hasOtherActivePromotions && (
        <div className="mt-4 border-t border-yellow-400 pt-4 dark:border-yellow-600">
          <p className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Active Promotions:
          </p>
          <ul className="space-y-2">
            {activePromotions.map((promo) => (
              <li key={promo.id}>
                {promo.blogSlug ? (
                  <Link
                    href={`/blog/${promo.blogSlug}`}
                    className="text-primary-600 underline hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    {promo.name} - {promo.discount}
                  </Link>
                ) : (
                  <span className="text-gray-800 dark:text-gray-200">
                    {promo.name} - {promo.discount}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
