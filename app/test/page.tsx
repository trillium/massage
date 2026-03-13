'use client'

import { useState } from 'react'

type Step = {
  actor: string
  action: string
  result: string
  status: number
}

type TestResult = {
  passed: boolean
  steps: Step[]
}

export default function DoubleBookingTestPage() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function runTest() {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/test/double-booking')
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Double Booking Fix Verification</h1>
      <p className="mb-6 text-accent-500 dark:text-accent-400">
        Simulates two users booking the same 11:00 AM slot. User 1 should succeed, User 2 should get
        a 409 conflict.
      </p>

      <button
        onClick={runTest}
        disabled={loading}
        className="mb-8 rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
      >
        {loading ? 'Running...' : 'Run Test'}
      </button>

      {result && (
        <div>
          <div
            className={`mb-6 rounded-xl border-2 p-4 text-center text-lg font-bold ${
              result.passed
                ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {result.passed ? 'PASS — Double booking prevented' : 'FAIL — Double booking allowed'}
          </div>

          <div className="space-y-3">
            {result.steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-lg border border-accent-200 p-4 dark:border-accent-700"
              >
                <div
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                    step.actor === 'User 1'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}
                >
                  {step.actor}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.action}</div>
                  <div className="text-sm text-accent-500 dark:text-accent-400">{step.result}</div>
                </div>
                <div
                  className={`shrink-0 rounded px-2 py-1 text-sm font-mono font-bold ${
                    step.status === 200
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {step.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
