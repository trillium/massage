'use client'

import React from 'react'
import { AppointmentRequestType } from '@/lib/types'
import { H3 } from '@/components/ui/heading'

import { Button } from '@/components/ui/button'

interface DebugDataProps {
  submittedData: AppointmentRequestType | null
  onReset?: () => void
}

export default function DebugData({ submittedData, onReset }: DebugDataProps) {
  if (!submittedData) {
    return null
  }

  return (
    <div className="mt-12 rounded-lg bg-surface-200 p-6 dark:bg-surface-700">
      <div className="mb-4 flex items-center justify-between">
        <H3>Debug: Submitted Data</H3>
        {onReset && (
          <Button
            onClick={onReset}
            className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            Reset Flow
          </Button>
        )}
      </div>
      <pre className="overflow-x-auto text-xs text-accent-600 dark:text-accent-400">
        {JSON.stringify(submittedData, null, 2)}
      </pre>
    </div>
  )
}
