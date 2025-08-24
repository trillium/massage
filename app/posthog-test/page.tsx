'use client'
import { useCallback, useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'

export default function PostHogTestPage() {
  const posthog = usePostHog()
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testPostHog = useCallback(async () => {
    setIsLoading(true)
    setResults([])

    try {
      // Test 1: Check if PostHog is loaded
      addResult(`PostHog object exists: ${!!posthog}`)
      addResult(`PostHog loaded: ${posthog?.__loaded}`)
      addResult(`Distinct ID: ${posthog?.get_distinct_id()}`)

      // Enable PostHog debug mode
      if (posthog) {
        posthog.debug()
        addResult('PostHog debug mode enabled')
      }

      // Test 2: Check environment variables
      addResult(`POSTHOG_KEY present: ${!!process.env.NEXT_PUBLIC_POSTHOG_KEY}`)
      addResult(`POSTHOG_DISABLED: ${process.env.NEXT_PUBLIC_DISABLE_POSTHOG}`)
      addResult(`API HOST: /ingest (using proxy)`)

      // Test 3: Test event capture
      if (posthog && posthog.__loaded) {
        posthog.capture('posthog_test_event', {
          timestamp: new Date().toISOString(),
          test: true,
          page: 'posthog-test',
        })
        addResult('✅ Test event captured successfully')
      } else {
        addResult('❌ Cannot capture event - PostHog not loaded')
      }

      // Test 4: Test network connectivity to proxy
      try {
        const response = await fetch('/ingest/decide', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: process.env.NEXT_PUBLIC_POSTHOG_KEY,
            distinct_id: 'test-user',
          }),
        })

        if (response.ok) {
          addResult('✅ Proxy /ingest/decide is working')
          const data = await response.json()
          addResult(`Response: ${JSON.stringify(data).substring(0, 100)}...`)
        } else {
          addResult(`❌ Proxy /ingest/decide failed: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        addResult(`❌ Network error: ${error}`)
      }

      // Test 5: Check if PostHog config is loaded
      try {
        const configResponse = await fetch(
          `/ingest/array/${process.env.NEXT_PUBLIC_POSTHOG_KEY}/config`
        )
        if (configResponse.ok) {
          addResult('✅ PostHog config endpoint is accessible')
        } else {
          addResult(`❌ PostHog config endpoint failed: ${configResponse.status}`)
        }
      } catch (error) {
        addResult(`❌ Config endpoint error: ${error}`)
      }
    } catch (error) {
      addResult(`❌ Test error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }, [posthog])

  useEffect(() => {
    // Auto-run test on page load
    testPostHog()
  }, [testPostHog])

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">PostHog Debug Test</h1>

      <div className="mb-6">
        <button
          onClick={testPostHog}
          disabled={isLoading}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Testing...' : 'Run PostHog Tests'}
        </button>
      </div>

      <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Test Results:</h2>
        <div className="space-y-2 font-mono text-sm">
          {results.map((result, index) => (
            <div key={index} className="rounded border bg-white p-2 dark:bg-gray-700">
              {result}
            </div>
          ))}
        </div>
        {results.length === 0 && !isLoading && (
          <p className="text-gray-500">No test results yet. Click "Run PostHog Tests" to start.</p>
        )}
      </div>

      <div className="mt-8 rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900">
        <h3 className="mb-2 font-semibold">What to look for:</h3>
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>✅ PostHog should be loaded and have a distinct ID</li>
          <li>✅ Environment variables should be present</li>
          <li>✅ Test event should capture successfully</li>
          <li>✅ Proxy endpoints should return 200 status</li>
          <li>❌ Any red X marks indicate issues to investigate</li>
        </ul>
      </div>
    </div>
  )
}
