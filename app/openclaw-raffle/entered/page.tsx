'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SectionContainer from '@/components/SectionContainer'
import Link from 'next/link'
import { useReduxRaffle } from '@/redux/hooks'

const INTEREST_LABELS: Record<string, string> = {
  in_home: 'In-home massage',
  in_office: 'In-office massage',
}

export default function RaffleEnteredPage() {
  const router = useRouter()
  const raffle = useReduxRaffle()

  useEffect(() => {
    if (!raffle) {
      router.replace('/openclaw-raffle')
    }
  }, [raffle, router])

  if (!raffle) return null

  const { raffleName, name, email, phone, zip, interests } = raffle

  return (
    <SectionContainer>
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-3xl font-bold">You're Entered!</h1>
        {raffleName && (
          <p className="mb-2 text-lg">
            Raffle: <span className="font-semibold">{raffleName}</span>
          </p>
        )}
        <p className="mb-6 text-surface-600 dark:text-surface-400">
          Thanks for entering! We'll reach out if you're selected.
        </p>

        <div className="mb-8 w-full max-w-lg rounded-lg border-2 border-surface-200 bg-surface-50 text-left shadow-md dark:border-surface-700 dark:bg-surface-900">
          <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <p className="text-sm text-surface-500 dark:text-surface-400">Name</p>
            <p className="font-semibold">{name}</p>
          </div>
          <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <p className="text-sm text-surface-500 dark:text-surface-400">Email</p>
            <p>{email}</p>
          </div>
          <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <p className="text-sm text-surface-500 dark:text-surface-400">Phone</p>
            <p>{phone}</p>
          </div>
          {zip && (
            <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
              <p className="text-sm text-surface-500 dark:text-surface-400">Zip Code</p>
              <p>{zip}</p>
            </div>
          )}
          {interests.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-sm text-surface-500 dark:text-surface-400">Interested in</p>
              <p>{interests.map((i) => INTEREST_LABELS[i] || i).join(', ')}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link
            href="/openclaw-raffle"
            className="rounded border-2 border-surface-300 px-6 py-2 font-semibold text-surface-600 transition-colors hover:bg-surface-100 dark:border-surface-600 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            Edit Entry
          </Link>
          <Link
            href="/"
            className="bg-primary-600 hover:bg-primary-700 rounded px-6 py-2 font-semibold text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </SectionContainer>
  )
}
