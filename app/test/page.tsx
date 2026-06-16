'use client'

import { useState } from 'react'
import pagesData from '@/data/pages.json'

import { Button } from '@/components/ui/button'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const testText = pagesData.test

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
    <Box className="mx-auto max-w-2xl px-4 py-12">
      {/* ds-ignore */}
      <H1 className="mb-2 text-2xl font-bold">{testText.heading}</H1>
      <TextBase status="muted" className="mb-6">
        {testText.description}
      </TextBase>
      <Button
        onClick={runTest}
        disabled={loading}
        className="mb-8 rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
      >
        {loading ? testText.runningButton : testText.runTestButton}
      </Button>
      {result && (
        <Box>
          <Box
            className={`mb-6 rounded-xl border-2 p-4 text-center text-lg font-bold ${
              result.passed
                ? 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {result.passed ? testText.passMessage : testText.failMessage}
          </Box>

          <Box className="space-y-3">
            {result.steps.map((step, i) => (
              <Stack
                direction="row"
                align="start"
                gap={4}
                className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
                key={i}
              >
                <Box
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                    step.actor === 'User 1'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}
                >
                  {step.actor}
                </Box>
                <Box className="flex-1">
                  <Box className="font-medium">{step.action}</Box>
                  <Box className="text-sm text-accent-500 dark:text-accent-400">{step.result}</Box>
                </Box>
                <Box
                  className={`shrink-0 rounded px-2 py-1 text-sm font-mono font-bold ${
                    step.status === 200
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {step.status}
                </Box>
              </Stack>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}
