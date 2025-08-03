'use client'

import React from 'react'
import { AppointmentRequestType } from '@/lib/schema'

interface DebugDataProps {
  submittedData: AppointmentRequestType | null
  onReset?: () => void
}

export default function DebugData({ submittedData, onReset }: DebugDataProps) {
  if (!submittedData) {
    return null
  }

  return (
    <div className="mt-12 rounded-lg bg-gray-100 p-6 dark:bg-gray-700">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Debug: Submitted Data
        </h3>
        {onReset && (
          <button
            onClick={onReset}
            className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            Reset Flow
          </button>
        )}
      </div>
      <pre className="overflow-x-auto text-xs text-gray-600 dark:text-gray-400">
        {JSON.stringify(submittedData, null, 2)}
      </pre>
    </div>
  )
}
