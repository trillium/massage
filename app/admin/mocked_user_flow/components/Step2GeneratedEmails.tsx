'use client'

import React from 'react'
import EmailMockComponent from '../EmailMockComponent'

interface Step2GeneratedEmailsProps {
  therapistEmail: { subject: string; body: string } | null
  clientEmail: { subject: string; body: string } | null
  approveUrl: string
  onApprovalClick: () => void
}

export default function Step2GeneratedEmails({
  therapistEmail,
  clientEmail,
  approveUrl,
  onApprovalClick,
}: Step2GeneratedEmailsProps) {
  if (!therapistEmail || !clientEmail) {
    return null
  }

  return (
    <div className="mb-12 rounded-lg bg-surface-50 p-6 shadow dark:bg-surface-800">
      <h2 className="mb-4 text-xl font-semibold text-accent-800 dark:text-accent-200">
        Step 2: Generated Emails
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-medium text-accent-700 dark:text-accent-300">
            Therapist Approval Email
          </h3>
          <EmailMockComponent
            email={therapistEmail}
            approveUrl={approveUrl}
            onApprovalClick={onApprovalClick}
          />
        </div>

        <div>
          <h3 className="mb-2 text-lg font-medium text-accent-700 dark:text-accent-300">
            Client Confirmation Email
          </h3>
          <EmailMockComponent email={clientEmail} />
        </div>
      </div>
    </div>
  )
}
