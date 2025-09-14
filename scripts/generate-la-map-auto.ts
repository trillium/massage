#!/usr/bin/env tsx

/**
 * Fully automated script to generate LA map image using Puppeteer
 * Usage: npx tsx scripts/generate-la-map.ts
 */

import puppeteer from 'puppeteer'
import { promises as fs } from 'fs'
import path from 'path'
import { generateStandaloneMapHTML } from '@/lib/generateStaticMapHTML'
import { LA_BOUNDS, IMAGE_CONFIG } from '@/lib/mapConfig'

// Type declarations for browser globals
declare global {
  interface Window {
    maplibregl?: unknown
    map?: {
      loaded(): boolean
    }
    mapReady?: boolean
  }
}

async function main() {
  console.log('🗺️  Generating Los Angeles map image automatically...\n')

  console.log('📍 LA Bounds:', LA_BOUNDS)
  console.log('📐 Image Config:', IMAGE_CONFIG)
  console.log('')

  try {
    // Step 1: Create standalone HTML content
    console.log('📄 Generating standalone HTML content...')
    const htmlContent = generateStandaloneMapHTML()

    // Create temporary HTML file
    const tempHtmlPath = path.resolve(process.cwd(), 'temp-map-generator.html')
    await fs.writeFile(tempHtmlPath, htmlContent)
    console.log('✅ Temporary HTML file created')

    // Step 2: Launch Puppeteer and capture the map
    console.log('🤖 Launching automated browser...')
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    })

    const page = await browser.newPage()

    // Set viewport to match our image size
    await page.setViewport({
      width: IMAGE_CONFIG.width,
      height: IMAGE_CONFIG.height,
      deviceScaleFactor: 1,
    })

    console.log('📍 Navigating to map generator page...')
    const htmlUrl = `file://${tempHtmlPath}`
    await page.goto(htmlUrl, { waitUntil: 'networkidle2', timeout: 60000 })

    console.log('⏳ Waiting for map to load and tiles to render...')
    // Wait for map to be ready
    await page.waitForFunction(
      () => {
        return window.mapReady === true
      },
      { timeout: 60000 }
    )

    // Wait a bit more for any final tile loading
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log('📸 Capturing map screenshot...')
    // Take screenshot of just the map element
    const mapElement = await page.$('#map')
    if (!mapElement) {
      throw new Error('Map element not found')
    }

    const screenshot = await mapElement.screenshot({
      type: 'png',
    })

    await browser.close()

    // Step 3: Save the image
    const outputPath = path.resolve(process.cwd(), 'public', 'la-map.png')
    await fs.writeFile(outputPath, screenshot)

    console.log('✅ LA map image generated successfully!')
    console.log(`   📁 Saved to: ${outputPath}`)
    console.log(`   📏 Size: ${IMAGE_CONFIG.width} x ${IMAGE_CONFIG.height} pixels`)

    // Clean up the temporary HTML file
    console.log('🧹 Cleaning up temporary files...')
    await fs.unlink(tempHtmlPath)

    console.log('\n🎉 Done! Your LA map is ready to use in StaticSpriteMap component.')
  } catch (error) {
    console.error('❌ Error generating map:', error)

    // Clean up on error
    try {
      const tempHtmlPath = path.resolve(process.cwd(), 'temp-map-generator.html')
      await fs.unlink(tempHtmlPath)
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    process.exit(1)
  }
}

main()
