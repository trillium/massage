#!/usr/bin/env node

/**
 * Script to capture test data from the API
 *
 * Usage:
 *   node scripts/capture-test-data.mjs                    # Interactive mode
 *   node scripts/capture-test-data.mjs --list             # List captured files
 *   node scripts/capture-test-data.mjs --type=next        # Capture next-type data
 *   node scripts/capture-test-data.mjs --type=scheduled-site --slug=acme
 *   node scripts/capture-test-data.mjs --port=3000        # Use custom port
 */

import readline from 'readline'

const DEFAULT_PORT = 9876

// Parse command line arguments
const args = process.argv.slice(2)
const options = {}
args.forEach((arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=')
    options[key] = value === undefined ? true : value
  }
})

const port = options.port || DEFAULT_PORT
const API_URL = `http://localhost:${port}/api/dev-mode-prod-excluded/capture-test-data`

async function captureData(params) {
  try {
    console.log('📸 Capturing test data with params:', params)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ Success!')
      console.log('📁 File:', result.filename)
      console.log('📊 Summary:', result.summary)
    } else {
      console.error('❌ Error:', result.error)
      if (result.details) {
        console.error('Details:', result.details)
      }
    }
  } catch (error) {
    console.error('❌ Failed to capture data:', error.message)
    console.error(`Make sure the development server is running on port ${port}`)
  }
}

async function listCapturedFiles() {
  try {
    const response = await fetch(API_URL)
    const result = await response.json()

    if (result.success) {
      console.log(`📁 Found ${result.count} captured files:`)
      result.files.forEach((file) => {
        console.log(`  - ${file}`)
      })
    } else {
      console.error('❌ Error:', result.error)
    }
  } catch (error) {
    console.error('❌ Failed to list files:', error.message)
    console.error(`Make sure the development server is running on port ${port}`)
  }
}

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const question = (prompt) =>
    new Promise((resolve) => {
      rl.question(prompt, resolve)
    })

  console.log('🔍 Interactive Test Data Capture\n')

  const configs = [
    { type: 'area-wide', name: 'Area-wide availability' },
    { type: 'fixed-location', name: 'Fixed location' },
    { type: 'scheduled-site', name: 'Scheduled site (requires slug)' },
    { type: 'next', name: 'Next available after event' },
  ]

  console.log('Available configurations:')
  configs.forEach((config, index) => {
    console.log(`  ${index + 1}. ${config.name}`)
  })

  const choice = await question('\nSelect configuration type (1-4): ')
  const configIndex = parseInt(choice) - 1

  if (configIndex < 0 || configIndex >= configs.length) {
    console.log('Invalid choice')
    rl.close()
    return
  }

  const selectedConfig = configs[configIndex]
  const params = {
    type: selectedConfig.type,
    captureMode: 'full',
  }

  if (selectedConfig.type === 'scheduled-site') {
    params.bookingSlug = await question('Enter booking slug (e.g., acme-scheduled): ')
  }

  const duration = await question('Duration in minutes (default: 60): ')
  if (duration) {
    params.duration = parseInt(duration)
  }

  const date = await question('Date (YYYY-MM-DD format, optional): ')
  if (date) {
    params.date = date
  }

  if (selectedConfig.type === 'next') {
    const eventId = await question('Event ID (optional, leave blank to auto-detect): ')
    if (eventId) {
      params.eventId = eventId
    }
  }

  rl.close()

  await captureData(params)
}

// Main execution
async function main() {
  if (options.list) {
    await listCapturedFiles()
  } else if (options.type) {
    // Direct capture mode
    const params = {
      type: options.type,
      bookingSlug: options.slug,
      duration: options.duration ? parseInt(options.duration) : 60,
      date: options.date,
      eventId: options.eventId,
      captureMode: 'full',
    }
    await captureData(params)
  } else {
    // Interactive mode
    await interactiveMode()
  }
}

main().catch(console.error)
