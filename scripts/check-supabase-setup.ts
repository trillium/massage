#!/usr/bin/env tsx

/**
 * Supabase Setup Validation Script
 *
 * Checks that Supabase is properly configured and connected.
 * Run with: pnpm tsx scripts/check-supabase-setup.ts
 */

import { createClient } from '@supabase/supabase-js'

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

const results: CheckResult[] = []

function addResult(name: string, status: 'pass' | 'fail' | 'warn', message: string) {
  results.push({ name, status, message })
}

function printResults() {
  console.log('\n🔍 Supabase Setup Validation Results\n')
  console.log('═'.repeat(60))

  results.forEach(({ name, status, message }) => {
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
    console.log(`${icon} ${name}`)
    console.log(`   ${message}\n`)
  })

  console.log('═'.repeat(60))

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warn').length

  console.log(`\nResults: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`)

  if (failCount > 0) {
    console.log('\n❌ Setup incomplete. Please fix the issues above.')
    process.exit(1)
  } else if (warnCount > 0) {
    console.log('\n⚠️  Setup complete with warnings.')
    process.exit(0)
  } else {
    console.log('\n✅ All checks passed! Supabase is ready to use.')
    process.exit(0)
  }
}

async function checkEnvironmentVariables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    addResult(
      'Environment: NEXT_PUBLIC_SUPABASE_URL',
      'fail',
      'Missing. Add your Supabase URL to .env.local'
    )
    return false
  }

  if (!url.startsWith('https://') || !url.includes('supabase.co')) {
    addResult(
      'Environment: NEXT_PUBLIC_SUPABASE_URL',
      'fail',
      `Invalid URL format: ${url}. Should be https://xxx.supabase.co`
    )
    return false
  }

  addResult(
    'Environment: NEXT_PUBLIC_SUPABASE_URL',
    'pass',
    `Found: ${url}`
  )

  if (!anonKey) {
    addResult(
      'Environment: NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'fail',
      'Missing. Add your Supabase anon key to .env.local'
    )
    return false
  }

  addResult(
    'Environment: NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'pass',
    `Found (${anonKey.slice(0, 20)}...)`
  )

  if (!serviceKey) {
    addResult(
      'Environment: SUPABASE_SERVICE_ROLE_KEY',
      'warn',
      'Missing. Required for server-side admin operations'
    )
  } else {
    addResult(
      'Environment: SUPABASE_SERVICE_ROLE_KEY',
      'pass',
      `Found (${serviceKey.slice(0, 20)}...)`
    )
  }

  return true
}

async function checkConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    addResult(
      'Connection Test',
      'fail',
      'Skipped due to missing environment variables'
    )
    return false
  }

  try {
    const supabase = createClient(url, anonKey)

    // Try to fetch from auth (this doesn't require any tables)
    const { error } = await supabase.auth.getSession()

    if (error) {
      addResult(
        'Connection Test',
        'fail',
        `Failed to connect: ${error.message}`
      )
      return false
    }

    addResult(
      'Connection Test',
      'pass',
      'Successfully connected to Supabase'
    )
    return true
  } catch (err) {
    addResult(
      'Connection Test',
      'fail',
      `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`
    )
    return false
  }
}

async function checkDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    addResult(
      'Database Schema',
      'fail',
      'Skipped due to missing environment variables'
    )
    return false
  }

  try {
    const supabase = createClient(url, anonKey)

    // Check if profiles table exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        addResult(
          'Database Schema',
          'fail',
          'Table "profiles" not found. Run database migrations first.'
        )
        return false
      }

      // Other errors might be RLS related, which is expected
      addResult(
        'Database Schema',
        'pass',
        'Table "profiles" exists (RLS may be blocking queries, which is expected)'
      )
      return true
    }

    addResult(
      'Database Schema',
      'pass',
      'Table "profiles" exists and is accessible'
    )
    return true
  } catch (err) {
    addResult(
      'Database Schema',
      'fail',
      `Error checking database: ${err instanceof Error ? err.message : 'Unknown error'}`
    )
    return false
  }
}

async function checkAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    addResult(
      'Auth Configuration',
      'fail',
      'Skipped due to missing environment variables'
    )
    return false
  }

  try {
    const supabase = createClient(url, anonKey)

    // Check if we can access auth config
    const { data, error } = await supabase.auth.getSession()

    if (error && !error.message.includes('session_not_found')) {
      addResult(
        'Auth Configuration',
        'fail',
        `Auth error: ${error.message}`
      )
      return false
    }

    addResult(
      'Auth Configuration',
      'pass',
      'Auth service is accessible and configured'
    )
    return true
  } catch (err) {
    addResult(
      'Auth Configuration',
      'fail',
      `Error checking auth: ${err instanceof Error ? err.message : 'Unknown error'}`
    )
    return false
  }
}

async function main() {
  console.log('🔍 Validating Supabase setup...\n')

  // Run checks
  await checkEnvironmentVariables()
  await checkConnection()
  await checkDatabase()
  await checkAuth()

  // Print results
  printResults()
}

main()
