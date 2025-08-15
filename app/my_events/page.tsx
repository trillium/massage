import React, { Suspense } from 'react'
import MyEventsPageClient from './components/MyEventsPageClient'

function MyEventsPageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>
          <div className="rounded-lg bg-gray-50 p-6 shadow-sm dark:bg-gray-800">
            <div className="animate-pulse">
              <div className="mb-4 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MyEventsPage() {
  return (
    <Suspense fallback={<MyEventsPageSkeleton />}>
      <MyEventsPageClient />
    </Suspense>
  )
}
