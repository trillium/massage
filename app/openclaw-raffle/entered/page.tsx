'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SectionContainer from '@/components/SectionContainer'
import Link from 'next/link'
import { useReduxFormData } from '@/redux/hooks'

import { RAFFLE_INTEREST_LABELS } from '@/lib/schema'
import raffleData from '@/data/raffle.json'
import { H1 } from '@/components/ui/heading'
import { TextLg, TextSmMuted, TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

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
      <Stack className="min-h-[40vh] text-center" direction="col" align="center" justify="center">
        <H1 className="mb-4">{enteredText.successHeading}</H1>
        {raffleName && (
          <TextLg className="mb-2">
            {enteredText.raffleLabel} <span className="font-semibold">{raffleName}</span>
          </TextLg>
        )}
        <TextBase className="mb-6 text-surface-600 dark:text-surface-400">
          {enteredText.successMessage}
        </TextBase>

        <Box className="mb-8 w-full max-w-lg rounded-lg border-2 border-surface-200 bg-surface-50 text-left shadow-md dark:border-surface-700 dark:bg-surface-900">
          <Box className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <TextSmMuted>{enteredText.nameLabel}</TextSmMuted>
            <TextBase className="font-semibold">{name}</TextBase>
          </Box>
          <Box className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <TextSmMuted>{enteredText.emailLabel}</TextSmMuted>
            <TextBase>{email}</TextBase>
          </Box>
          <Box className="border-b border-surface-200 px-5 py-3 dark:border-surface-700">
            <TextSmMuted>{enteredText.phoneLabel}</TextSmMuted>
            <TextBase>{phone}</TextBase>
          </Box>
          {interests && interests.length > 0 && (
            <Box className="px-5 py-3">
              <TextSmMuted>{enteredText.interestedInLabel}</TextSmMuted>
              <TextBase>{interests.map((i) => RAFFLE_INTEREST_LABELS[i] || i).join(', ')}</TextBase>
            </Box>
          )}
        </Box>

        <Stack direction="row" gap={4}>
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
        </Stack>
      </Stack>
    </SectionContainer>
  )
}
