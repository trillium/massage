import Link from '@/components/Link'
import eventContent from '@/data/event.json'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-accent-900 dark:text-white">
          {eventContent.notFound.heading}
        </h1>
        <p className="mb-8 text-lg text-accent-600 dark:text-accent-400">
          {eventContent.notFound.message}
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          {eventContent.notFound.homeLink}
        </Link>
      </div>
    </div>
  )
}
