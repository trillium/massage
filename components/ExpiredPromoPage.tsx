import Template from '@/components/Template'
import Link from '@/components/Link'

interface ExpiredPromoPageProps {
  title: string
  promoEndDate: string
  originalText?: string | null
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <span className="text-4xl">⏰</span>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Promotion Expired
          </h1>

          <Template title={title} text={`This promotional offer expired on ${formattedDate}.`} />

          {originalText && (
            <div className="mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Original offer:</span> {originalText}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Don't worry! You can still book a massage at regular rates.
          </p>

          <div className="flex flex-col items-center space-y-3 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <Link
              href="/book"
              className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md px-6 py-3 text-base font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              Book Regular Session
            </Link>

            <Link
              href="/"
              className="focus:ring-primary-500 inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Looking for current promotions?{' '}
            <Link
              href="/about"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Check our about page
            </Link>{' '}
            or{' '}
            <Link
              href="/contact"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              contact us directly
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
