'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SectionContainer from '@/components/SectionContainer'
import Link from 'next/link'
import { useReduxFormData } from '@/redux/hooks'

import { RAFFLE_INTEREST_LABELS } from '@/lib/schema'
import raffleData from '@/data/raffle.json'
import { H1 } from '@/components/ui/heading'
import { TextLg, TextSmMuted,
  TextBase,
} from '@/components/ui/text'

const enteredText = raffleData.openclawEntered

export default function RaffleEnteredPage() {
  const router = useRouter()
  const formData = useReduxFormData()

  useEffect(() => {
    if (!formData?.raffleName) {
      router.replace('/openclaw-raffle')
    }
  }, [formData, router])

  if (!formData?.raffleName) return null

  const name = [formData.firstName, formData.lastName].filter(Boolean).join(' ')
  const { raffleName, email, phone, raffleInterests: interests } = formData

  return (
    <SectionContainer>
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <H1 className="mb-4">{enteredText.successHeading}</H1>
        {raffleName && (
          <TextLg className="mb-2">
            {enteredText.raffleLabel} <span className="font-semibold">{raffleName}</span>
          </TextLg>
        )}
        <TextBase className="mb-6 text-surface-600 dark:text-surface-400">{enteredText.successMessage}</TextBase>

        <div className="mb-8 w-full max-w-lg rounded-lg border-2 border-surface-200 bg-surface-50 text-left shadow-md dark:border-surface-700 dark:bg-surface-900">
          <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <TextSmMuted>{enteredText.nameLabel}</TextSmMuted>
            <TextBase className="font-semibold">{name}</TextBase>
          </div>
          <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <TextSmMuted>{enteredText.emailLabel}</TextSmMuted>
            <TextBase>{email}</TextBase>
          </div>
          <div className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <TextSmMuted>{enteredText.phoneLabel}</TextSmMuted>
            <TextBase>{phone}</TextBase>
          </div>
          {interests && interests.length > 0 && (
            <div className="px-5 py-3">
              <TextSmMuted>{enteredText.interestedInLabel}</TextSmMuted>
              <TextBase>{interests.map((i) => RAFFLE_INTEREST_LABELS[i] || i).join(', ')}</TextBase>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link
            href="/openclaw-raffle"
            className="rounded border-2 border-surface-300 px-6 py-2 font-semibold text-surface-600 transition-colors hover:bg-surface-100 dark:border-surface-600 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            {enteredText.editEntryButton}
          </Link>
          <Link
            href="/"
            className="bg-primary-600 hover:bg-primary-700 rounded px-6 py-2 font-semibold text-white transition-colors"
          >
            {enteredText.backToHomeButton}
          </Link>
        </div>
      </div>
    </SectionContainer>
  )
}
