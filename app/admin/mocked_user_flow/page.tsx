'use client'

import React from 'react'
import Step1BookingSelection from './components/Step1BookingSelection'
import Step1_5UserConfirmation from './components/Step1_5UserConfirmation'
import Step2GeneratedEmails from './components/Step2GeneratedEmails'
import Step3TherapistApproval from './components/Step3TherapistApproval'
import Step4FinalConfirmation from './components/Step4FinalConfirmation'
import Step5EventObjectDetails from './components/Step5EventObjectDetails'
import DebugData from './components/DebugData'
import ConfigurationTester from 'components/admin/ConfigurationTester'
import { useMockedUserFlow } from './hooks/useMockedUserFlow'
import SectionContainer from '@/components/SectionContainer'
import { TextSmMuted, TextBase } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'

export default function MockedUserFlowPage() {
  const {
    selectedDuration,
    submittedData,
    therapistEmail,
    clientEmail,
    approveUrl,
    isConfirmed,
    handleMockedSubmit,
    handleApprovalClick,
    handleReset,
    durationProps,
  } = useMockedUserFlow()

  return (
    <SectionContainer>
      <div className="min-h-screen bg-surface-100 py-8 dark:bg-surface-900">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="sticky top-0 z-20 mb-8 flex items-center justify-between rounded bg-surface-200 px-6 py-4 shadow dark:bg-surface-800">
            <Stack direction="row" align="center" gap={4}>
              <TextBase
                as="span"
                className="text-xl font-bold text-accent-900 dark:text-accent-100"
              >
                Mocked User Flow - Admin
              </TextBase>
              <TextSmMuted className="hidden md:inline">
                Simulates the entire booking flow (no emails or calendar events)
              </TextSmMuted>
            </Stack>
            <Button
              onClick={handleReset}
              className="rounded bg-surface-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-surface-700 dark:bg-surface-700 dark:hover:bg-surface-600"
            >
              Reset Flow
            </Button>
          </nav>

          <div className="mb-8">
            <ConfigurationTester />
          </div>

          <Step1BookingSelection
            selectedDuration={selectedDuration}
            onSubmit={handleMockedSubmit}
            durationProps={durationProps}
          />

          <Step1_5UserConfirmation submittedData={submittedData} />

          <Step2GeneratedEmails
            therapistEmail={therapistEmail}
            clientEmail={clientEmail}
            approveUrl={approveUrl}
            onApprovalClick={handleApprovalClick}
          />

          <Step3TherapistApproval
            approveUrl={approveUrl}
            isConfirmed={isConfirmed}
            onApprovalClick={handleApprovalClick}
          />

          <Step4FinalConfirmation isConfirmed={isConfirmed} submittedData={submittedData} />

          <Step5EventObjectDetails submittedData={submittedData} isConfirmed={isConfirmed} />

          <DebugData submittedData={submittedData} onReset={handleReset} />
        </div>
      </div>
    </SectionContainer>
  )
}
