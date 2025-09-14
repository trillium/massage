#!/usr/bin/env tsx

import { config } from 'dotenv'
config({ path: '.env.local' })
import { pushoverSendMesage } from '../lib/messaging/push/admin/pushover'

async function main() {
  const token = process.env.PUSHOVER_API_KEY
  const userKey = process.env.PUSHOVER_USER_KEY

  if (!token || !userKey) {
    console.error('❌ Pushover environment variables not set.')
    console.error(
      'Please ensure PUSHOVER_API_KEY and PUSHOVER_USER_KEY are defined in your .env file.'
    )
    process.exit(1)
  }

  const message = 'Test push notification from Trillium Massage'
  const title = 'Test Message'
  const priority = 0

  console.log('Sending test pushover message...')

  const success = await pushoverSendMesage({
    message,
    title,
    priority,
  })

  if (success) {
    console.log('✅ Test pushover message sent successfully!')
  } else {
    console.error('❌ Failed to send test pushover message.')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Error sending test pushover message:', error)
  process.exit(1)
})
