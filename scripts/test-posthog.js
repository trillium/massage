// Test script for PostHog - run this in browser console or create a test page

// Test 1: Check if PostHog is loaded
console.log('PostHog Status Check:')
console.log('- PostHog object exists:', !!window.posthog)
console.log('- PostHog loaded:', window.posthog?.__loaded)
console.log('- Distinct ID:', window.posthog?.get_distinct_id())

// Test 2: Capture a test event
if (window.posthog && window.posthog.__loaded) {
  console.log('Capturing test event...')
  window.posthog.capture('debug_test_event', {
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    test: true,
  })
  console.log('Test event captured!')
} else {
  console.log('PostHog not loaded - check configuration')
}

// Test 3: Check environment variables (client-side)
console.log('Environment Check:')
console.log('- POSTHOG_KEY present:', !!process.env.NEXT_PUBLIC_POSTHOG_KEY)
console.log('- POSTHOG_HOST:', process.env.NEXT_PUBLIC_POSTHOG_HOST)
console.log('- POSTHOG_DISABLED:', process.env.NEXT_PUBLIC_DISABLE_POSTHOG)

// Test 4: Network connectivity
fetch('/ingest/decide', { method: 'POST', body: '{}' })
  .then((response) => {
    console.log('PostHog proxy connectivity:', response.status === 200 ? 'OK' : 'Failed')
  })
  .catch((error) => {
    console.error('PostHog proxy error:', error)
  })
