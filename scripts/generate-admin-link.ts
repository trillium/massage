#!/usr/bin/env tsx

/**
 * CLI utility for generating admin access links
 * Usage: npm run admin:generate-link admin@example.com
 */

import * as dotenv from 'dotenv'
import { AdminAuthManager } from '@/lib/adminAuth'
import { timeValue } from '@/lib/adminAuth'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const emailArg = process.argv[2]

let email: string
if (emailArg === '--emailEnv') {
  const adminEmails = process.env.ADMIN_EMAILS
  if (!adminEmails) {
    console.error('Error: ADMIN_EMAILS environment variable is not set.')
    console.error(
      'Please set ADMIN_EMAILS in your .env.local file with a comma-separated list of admin emails.'
    )
    console.error('Example: ADMIN_EMAILS="admin@example.com,owner@example.com"')
    process.exit(1)
  }

  // Take the first email from the comma-separated list
  const emailList = adminEmails
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0)
  if (emailList.length === 0) {
    console.error('Error: ADMIN_EMAILS environment variable is empty or invalid.')
    process.exit(1)
  }

  email = emailList[0]
  if (emailList.length > 1) {
    console.log(`ℹ️  Found ${emailList.length} admin emails, using the first one: ${email}`)
    console.log(`   Available emails: ${emailList.join(', ')}`)
  }
} else {
  email = emailArg
}

const baseUrl = process.argv[3] || 'http://localhost:3000'

if (!email) {
  console.log(`\nUsage: npm run admin:generate-link <email|--emailEnv> [baseUrl]`)
  console.log(`Example: npm run admin:generate-link admin@example.com`)
  console.log(`\nOptions:`)
  console.log(`  <email>       The email address for the admin user.`)
  console.log(
    `  --emailEnv    Use the first email address from the ADMIN_EMAILS environment variable.`
  )
  console.log(
    `  [baseUrl]     Optional. The base URL for the admin link. Defaults to http://localhost:3000.`
  )
  process.exit(0)
}

// Validate email format
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Invalid email format:', email)
  process.exit(1)
}

const humanReadableTime = (ms: number) => {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days} day(s)`
  if (hours > 0) return `${hours} hour(s)`
  return `${minutes} minute(s)`
}

try {
  const adminLink = AdminAuthManager.generateAdminLink(email, baseUrl)

  console.log('\n🔒 Admin Access Link Generated')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Email: ${email}`)
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Link: ${adminLink}`)
  console.log('\n⚠️  Security Notice:')
  console.log('- This link provides full admin access')
  console.log(`- Session expires after ${humanReadableTime(timeValue)}`)
  console.log('- Do not share this link')
  console.log()
} catch (error) {
  console.error('Error generating admin link:', error)
  process.exit(1)
}
