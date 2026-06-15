import Link from '@/components/Link'
import { FaLeaf } from 'react-icons/fa'
import clsx from 'clsx'
import { home } from '@/app/content'
import landing from '@/data/landing.json'
import { H2, H3 } from '@/components/ui/heading'
import { TextSmMedium,
  TextBase,
} from '@/components/ui/text'

const pricingOptions = home.pricing.tiers.map((tier) => ({
  ...tier,
  duration: tier.minutes,
}))
const { heading, mostPopularBadge, bookNowButton, pricePrefix } = landing.pricing

export default function PricingSection() {
  return (
    <section className="flex w-full flex-col items-center bg-surface-50 dark:bg-surface-950">
      <div className="container">
        <H2 className="mb-8 text-center md:text-4xl dark:text-white">{heading}</H2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingOptions.map((option, i) => (
            <div key={i} className="group relative">
              {option.mostPopular && (
                <div
                  className={clsx(
                    borderClasses,
                    gradientColorClasses,
                    positionClassesBlurElem,
                    opacityClasses,
                    timingClasses
                  )}
                ></div>
              )}
              <div
                className={clsx(
                  positionClassesCardElem,
                  'z-10 flex h-full flex-col items-center rounded-lg bg-surface-50 p-8 text-center shadow dark:bg-surface-800 dark:text-accent-100',
                  {
                    'ring-primary-500 ring-2': option.mostPopular,
                  }
                )}
              >
                {option.mostPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                    <TextSmMedium className="bg-primary-500 rounded-full px-3 py-1 whitespace-nowrap">
                      {mostPopularBadge}
                    </TextSmMedium>
                  </div>
                )}
                <H3 className="mb-2 dark:text-white" data-content="pricing.tier.title">
                  {option.title}
                </H3>
                <div
                  className="text-primary-600 dark:text-primary-400 mb-4 text-3xl font-bold"
                  data-content="pricing.tier.price"
                >
                  {pricePrefix}
                  {option.price}
                </div>
                <ul className="mb-4 items-start space-y-4 text-left text-accent-600 dark:text-accent-300">
                  {option.features.map((feature, index) => (
                    <li
                      key={index}
                      className="relative list-none pl-6"
                      data-content="pricing.tier.feature"
                    >
                      {feature}
                      <TextBase as="span" className="text-primary-600 absolute top-0.5 -left-1 text-xl">
                        <FaLeaf />
                      </TextBase>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/book?duration=${option.duration}`}
                  className="bg-primary-600 hover:bg-primary-700 border-primary-500 mt-auto inline-block rounded border-2 px-4 py-2 font-semibold text-white transition-colors"
                >
                  {bookNowButton}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const gradientColorClasses = 'bg-gradient-to-b from-primary-600 to-primary-500'
const borderClasses = `rounded-lg`
const positionClassesBlurElem = 'absolute'
const positionClassesCardElem = 'relative'
const opacityClasses = 'blur opacity-25 -inset-2'
const timingClasses = 'duration-2000 group-hover:duration-400 animate-pulse'
