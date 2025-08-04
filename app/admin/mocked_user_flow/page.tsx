'use client'

import React from 'react'
import Step1BookingSelection from './components/Step1BookingSelection'
import Step1_5UserConfirmation from './components/Step1_5UserConfirmation'
import Step2GeneratedEmails from './components/Step2GeneratedEmails'
import Step3TherapistApproval from './components/Step3TherapistApproval'
import Step4FinalConfirmation from './components/Step4FinalConfirmation'
import DebugData from './components/DebugData'
import { useMockedUserFlow } from './hooks/useMockedUserFlow'

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
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4">
        <nav className="sticky top-0 z-20 mb-8 flex items-center justify-between rounded bg-gray-100 px-6 py-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Mocked User Flow - Admin
            </span>
            <span className="hidden text-sm text-gray-600 dark:text-gray-400 md:inline">
              Simulates the entire booking flow (no emails or calendar events)
            </span>
          </div>
          <button
            onClick={handleReset}
            className="whitespace-nowrap rounded bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Reset Flow
          </button>
        </nav>

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

        <DebugData submittedData={submittedData} onReset={handleReset} />
      </div>
    </div>
  )
}
