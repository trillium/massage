// PostHog Browser Console Test Script
// Copy and paste this into your browser console on any page of your app

console.log('🔍 PostHog Diagnostic Test Starting...\n')

// Test 1: Basic PostHog object check
console.log('1. PostHog Object Check:')
console.log('   - window.posthog exists:', !!window.posthog)
console.log('   - PostHog loaded:', window.posthog?.__loaded)
console.log('   - Distinct ID:', window.posthog?.get_distinct_id())
console.log('   - PostHog config:', window.posthog?.config)

// Test 2: Environment variables (client-side)
console.log('\n2. Environment Variables:')
console.log(
  '   - POSTHOG_KEY present:',
  !!window.__NEXT_DATA__?.buildId || 'Check Network tab for env vars'
)

// Test 3: Network connectivity test
console.log('\n3. Testing Network Connectivity:')

async function testNetworkConnectivity() {
  const tests = [
    { name: 'decide', path: '/ingest/decide', method: 'POST' },
    { name: 'config', path: '/ingest/array/test/config', method: 'GET' },
    { name: 'static', path: '/ingest/static/chunk-PGUQKT6S.js', method: 'GET' },
  ]

  for (const test of tests) {
    try {
      const response = await fetch(test.path, {
        method: test.method,
        headers: test.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: test.method === 'POST' ? JSON.stringify({ token: 'test' }) : undefined,
      })

      console.log(
        `   - ${test.name} (${test.method} ${test.path}):`,
        response.status,
        response.status < 400 ? '✅' : '❌'
      )
    } catch (error) {
      console.log(`   - ${test.name}:`, '❌ Network Error:', error.message)
    }
  }
}

// Test 4: Capture test event
if (window.posthog && window.posthog.__loaded) {
  console.log('\n4. Capturing Test Event:')
  try {
    window.posthog.capture('console_debug_test', {
      timestamp: new Date().toISOString(),
      test: true,
      source: 'browser_console',
    })
    console.log('   - Test event captured: ✅')
  } catch (error) {
    console.log('   - Test event failed: ❌', error)
  }
} else {
  console.log('\n4. Cannot test event capture - PostHog not loaded ❌')
}

// Run network tests
testNetworkConnectivity()

console.log('\n🔍 Diagnostic test complete. Check above results and Network tab in DevTools.')
console.log('📝 Also check the PostHog test page at: /posthog-test')
