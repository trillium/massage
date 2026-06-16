'use client'

import React from 'react'
import EmailMockComponent from '../EmailMockComponent'
import { H2, H3 } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'

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
      <H2 className="mb-4">Step 2: Generated Emails</H2>

      <div className="grid gap-6 md:grid-cols-2">
        <Box>
          <H3 className="mb-2">Therapist Approval Email</H3>
          <EmailMockComponent
            email={therapistEmail}
            approveUrl={approveUrl}
            onApprovalClick={onApprovalClick}
          />
        </Box>

        <Box>
          <H3 className="mb-2">Client Confirmation Email</H3>
          <EmailMockComponent email={clientEmail} />
        </Box>
      </div>
    </div>
  )
}
