'use client'

import React from 'react'

interface Step3TherapistApprovalProps {
  approveUrl: string
  isConfirmed: boolean
  onApprovalClick: () => void
}

export default function Step3TherapistApproval({
  approveUrl,
  isConfirmed,
  onApprovalClick,
}: Step3TherapistApprovalProps) {
  return (
    <div className="mb-12 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
        Step 3: Therapist Approval
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Therapist must accept the appointment to proceed
      </p>
      <button
        onClick={onApprovalClick}
        className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
      >
        Simulate Approval Click
      </button>
    </div>
  )
}
