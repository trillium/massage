import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Event Not Found</h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          The calendar event you're looking for doesn't exist or may have been removed.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
