'use client'

import React from 'react'
import { H2 } from '@/components/ui/heading'

import { Button } from '@/components/ui/button'

import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

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
    <Box className="mb-12 rounded-lg bg-surface-50 p-6 shadow dark:bg-surface-800">
      <H2 className="mb-4">Step 3: Therapist Approval</H2>
      <TextBase className="mb-4 text-accent-600 dark:text-accent-400">
        Therapist must accept the appointment to proceed
      </TextBase>
      <Button
        onClick={onApprovalClick}
        className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
      >
        Simulate Approval Click
      </Button>
    </Box>
  )
}
