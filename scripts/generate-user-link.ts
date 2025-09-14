#!/usr/bin/env tsx

/**
 * CLI utility for generating user my_events access links
 * Usage: npm run user:generate-link user@example.com
 */

import * as dotenv from 'dotenv'
import { UserAuthManager } from '@/lib/userAuth'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const emailArg = process.argv[2]

let email: string
if (emailArg === '--emailEnv') {
  // For users, we might not have a predefined list, so just use a default or require input
  console.error('Error: --emailEnv not supported for user links. Please provide an email address.')
  process.exit(1)
} else {
  email = emailArg
}

const baseUrl = process.argv[3] || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

if (!email) {
  console.log(`\nUsage: npm run user:generate-link <email> [baseUrl]`)
  console.log(`Example: npm run user:generate-link user@example.com`)
  console.log(`\nOptions:`)
  console.log(`  <email>       The email address for the user.`)
  console.log(
    `  [baseUrl]     Optional. The base URL for the link. Defaults to NEXT_PUBLIC_SITE_URL or http://localhost:3000.`
  )
  process.exit(0)
}

// Validate email format
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Invalid email format:', email)
  process.exit(1)
}

try {
  const userLink = UserAuthManager.generateMyEventsLink(email, baseUrl)

  console.log('\n🔗 User My Events Link Generated')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Email: ${email}`)
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Link: ${userLink}`)
  console.log('\n⚠️  Security Notice:')
  console.log('- This link provides access to user events')
  console.log('- Token expires after 24 hours')
  console.log('- Share securely')
  console.log()
} catch (error) {
  console.error('Error generating user link:', error)
  process.exit(1)
}
