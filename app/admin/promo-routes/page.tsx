import Link from '@/components/Link'
import AdminNav from '@/components/auth/admin/AdminNav'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import Template from '@/components/Template'
import { isPromoExpired } from '@/lib/utilities/promoValidation'
import SectionContainer from '@/components/SectionContainer'

export default async function PromoRoutesPage() {
  const slugConfigurations = await fetchSlugConfigurationData()

  // Filter out configurations that have discounts or are promotional in nature
  const promoRoutes = Object.entries(slugConfigurations).filter(([slug, config]) => {
    return (
      config.discount ||
      slug.includes('promo') ||
      slug.includes('midnight') ||
      slug.includes('nextdoor')
    )
  })

  // Get all routes for reference
  const allRoutes = Object.entries(slugConfigurations)

  return (
    <SectionContainer>
      <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4">
          <AdminNav gridCols="gap-3 md:grid-cols-2 lg:grid-cols-4" />

          <Template
            title="Promotional Routes Directory"
            text="Internal reference page for all booking routes and promotional configurations"
          />

          <div className="mt-8 space-y-8">
            {/* Promotional Routes Section */}
            <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                <span className="emoji">🎯</span> Promotional Routes ({promoRoutes.length})
              </h2>
              <div className="space-y-4">
                {promoRoutes.map(([slug, config]) => (
                  <div
                    key={slug}
                    className="border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          <Link
                            href={`/${slug}`}
                            className="hover:text-primary-600 hover:underline"
                          >
                            /{slug}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{config.title}</p>
                        {config.discount && (
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            <span className="emoji">💰</span>{' '}
                            {config.discount.type === 'percent'
                              ? `${config.discount.amountPercent! * 100}% off`
                              : `$${config.discount.amountDollars} off`}
                          </p>
                        )}
                        {config.promoEndDate && (
                          <p
                            className={`text-sm font-medium ${
                              isPromoExpired(config.promoEndDate)
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            <span className="emoji">
                              {isPromoExpired(config.promoEndDate)
                                ? '❌ Expired:'
                                : '⏰ Expires:'}{' '}
                            </span>
                            {config.promoEndDate}
                          </p>
                        )}
                        {config.text && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {config.text}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-200">
                          {config.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* All Routes Section */}
            <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                <span className="emoji">📋</span> All Available Routes ({allRoutes.length})
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {allRoutes.map(([slug, config]) => (
                  <div
                    key={slug}
                    className="rounded border p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          <Link
                            href={`/${slug}`}
                            className="hover:text-primary-600 hover:underline"
                          >
                            /{slug}
                          </Link>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{config.title}</p>
                      </div>
                      <div className="ml-2 flex flex-col items-end space-y-1">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            config.discount
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {config.type}
                        </span>
                        {config.discount && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            🎯 PROMO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      []
    </SectionContainer>
  )
}
