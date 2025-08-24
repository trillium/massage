import Link from '@/components/Link'
import { DEFAULT_PRICING } from 'config'
import { FaLeaf } from 'react-icons/fa'
import clsx from 'clsx'

const pricingStart = [
  {
    title: '60-Minute Massage',
    duration: 60,
    features: [
      'Focus on 1–2 specific areas of tension (e.g., neck, shoulders, or back)',
      'Good for stress relief and general relaxation',
      'Enough time for a focused therapeutic session or a lighter full-body pass',
    ],
  },
  {
    title: '90-Minute Massage',
    duration: 90,
    mostPopular: true,
    features: [
      'Balanced full-body massage with extra focus on 2–3 problem areas',
      'Ideal for combining relaxation and deeper therapeutic work',
      'Time to address chronic tightness while still covering the whole body',
    ],
  },
  {
    title: '120-Minute Massage',
    duration: 120,
    features: [
      'Comprehensive full-body massage with detailed work on multiple areas',
      'Best choice for chronic pain, athletes, or deeper restorative sessions',
      'Allows slow, thorough treatment without rushing any part of the body',
    ],
  },
]

const pricingOptions = pricingStart.map((item) => ({
  ...item,
  price: DEFAULT_PRICING[item.duration],
}))

export default function PricingSection() {
  return (
    <section className="flex w-full flex-col items-center bg-gray-50 dark:bg-gray-950">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl dark:text-white">Pricing</h2>
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
                  'z-10 flex h-full flex-col items-center rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800 dark:text-gray-100',
                  {
                    'ring-primary-500 ring-2': option.mostPopular,
                  }
                )}
              >
                {option.mostPopular && (
                  <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                      <span className="bg-primary-500 rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap text-white">
                        Most Popular
                      </span>
                    </div>
                  </>
                )}
                <h3 className="mb-2 text-xl font-semibold dark:text-white">{option.title}</h3>
                <div className="text-primary-600 dark:text-primary-400 mb-4 text-3xl font-bold">
                  ${option.price}
                </div>
                <ul className="mb-4 items-start space-y-4 text-left text-gray-600 dark:text-gray-300">
                  {option.features.map((feature, index) => (
                    <li key={index} className="relative list-none pl-6">
                      {feature}
                      <span className="text-primary-600 absolute top-0.5 -left-1 text-xl">
                        <FaLeaf />
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/book?duration=${option.duration}`}
                  className="bg-primary-600 hover:bg-primary-700 border-primary-500 mt-auto inline-block rounded border-2 px-4 py-2 font-semibold text-white transition-colors"
                >
                  Book Now
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
