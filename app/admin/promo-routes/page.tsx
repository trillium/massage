/* ds-ignore-file */
import Link from '@/components/Link'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import Template from '@/components/Template'
import { isPromoExpired } from '@/lib/utilities/promoValidation'
import SectionContainer from '@/components/SectionContainer'
import { FaCrosshairs, FaDollarSign, FaTimes, FaClock, FaClipboardList } from 'react-icons/fa'
import { H2, H3, H4 } from '@/components/ui/heading'
import { TextSmMedium, TextSmMuted, TextXs, TextXsMedium, TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

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
      <Box className="min-h-screen bg-surface-100 py-8 dark:bg-surface-900">
        <Box className="mx-auto max-w-4xl px-4">
          <Template
            title="Promotional Routes Directory"
            text="Internal reference page for all booking routes and promotional configurations"
          />

          <Box className="mt-8 space-y-8">
            {/* Promotional Routes Section */}
            <section className="rounded-lg bg-surface-50 p-6 shadow-md dark:bg-surface-800">
              <H2 className="mb-4 dark:text-white">
                <FaCrosshairs className="inline" /> Promotional Routes ({promoRoutes.length})
              </H2>
              <Box className="space-y-4">
                {promoRoutes.map(([slug, config]) => (
                  <Box
                    key={slug}
                    className="border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20"
                  >
                    <Stack direction="row" align="center" justify="between">
                      <Box className="flex-1">
                        <H3 className="dark:text-white">
                          <Link
                            href={`/${slug}`}
                            className="hover:text-primary-600 hover:underline"
                          >
                            /{slug}
                          </Link>
                        </H3>
                        <TextSmMuted>{config.title}</TextSmMuted>
                        {config.discount && (
                          <TextSmMedium status="success">
                            <FaDollarSign className="inline" />{' '}
                            {config.discount.type === 'percent'
                              ? `${config.discount.amountPercent! * 100}% off`
                              : `$${config.discount.amountDollars} off`}
                          </TextSmMedium>
                        )}
                        {config.promoEndDate && (
                          <TextSmMedium className="${ isPromoExpired(config.promoEndDate) ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400' }">
                            <span>
                              {isPromoExpired(config.promoEndDate) ? (
                                <>
                                  <FaTimes className="inline" /> Expired:
                                </>
                              ) : (
                                <>
                                  <FaClock className="inline" /> Expires:
                                </>
                              )}{' '}
                            </span>
                            {config.promoEndDate}
                          </TextSmMedium>
                        )}
                        {config.text && (
                          <Box className="mt-1 text-sm text-accent-500 dark:text-accent-400">
                            {Array.isArray(config.text) ? (
                              config.text.map((paragraph, index) => (
                                <TextBase key={index} className={index > 0 ? 'mt-1' : ''}>
                                  {paragraph}
                                </TextBase>
                              ))
                            ) : (
                              <TextBase>{config.text}</TextBase>
                            )}
                          </Box>
                        )}
                      </Box>
                      <Box className="ml-4 text-right">
                        <TextXsMedium
                          className="inline-block rounded-full bg-green-100 px-2 py-1 dark:bg-green-800"
                          status="success"
                        >
                          {config.type}
                        </TextXsMedium>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </section>

            {/* All Routes Section */}
            <section className="rounded-lg bg-surface-50 p-6 shadow-md dark:bg-surface-800">
              <H2 className="mb-4 dark:text-white">
                <FaClipboardList className="inline" /> All Available Routes ({allRoutes.length})
              </H2>
              <Box className="grid gap-3 md:grid-cols-2">
                {allRoutes.map(([slug, config]) => (
                  <Box
                    key={slug}
                    className="rounded border p-3 hover:bg-surface-100 dark:border-accent-700 dark:hover:bg-surface-700"
                  >
                    <Stack direction="row" align="center" justify="between">
                      <Box className="flex-1">
                        <H4 className="dark:text-white">
                          <Link
                            href={`/${slug}`}
                            className="hover:text-primary-600 hover:underline"
                          >
                            /{slug}
                          </Link>
                        </H4>
                        <TextSmMuted>{config.title}</TextSmMuted>
                      </Box>
                      <Stack className="ml-2 space-y-1" direction="col" align="end">
                        <TextXsMedium
                          className="inline-block rounded-full px-2 py-1 ${ config.discount ? 'bg-green-100 dark:bg-green-800 dark:text-green-200' : 'bg-surface-200 dark:bg-surface-700 dark:text-accent-200' }"
                          status="success"
                        >
                          {config.type}
                        </TextXsMedium>
                        {config.discount && (
                          <TextXs status="success">
                            <FaCrosshairs className="mr-1 inline" /> PROMO
                          </TextXs>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </section>
          </Box>
        </Box>
      </Box>
      []
    </SectionContainer>
  )
}
