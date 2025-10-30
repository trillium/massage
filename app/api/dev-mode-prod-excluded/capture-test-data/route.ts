import { NextRequest, NextResponse } from 'next/server'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import { captureTestData, listCapturedData } from '@/lib/utils/captureTestData'

/**
 * Development API endpoint to capture test data from real API calls
 * This endpoint is excluded from production builds via ignore-loader in next.config.js
 *
 * Usage:
 * GET /api/dev-mode-prod-excluded/capture-test-data - List all captured test data files
 * POST /api/dev-mode-prod-excluded/capture-test-data - Capture data for a specific configuration
 *
 * POST body example:
 * {
 *   "bookingSlug": "acme-scheduled",
 *   "duration": 60,
 *   "type": "scheduled-site",
 *   "captureMode": "full"
 * }
 */

export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const files = listCapturedData()
    return NextResponse.json({
      success: true,
      files,
      count: files.length,
    })
  } catch (error) {
    console.error('Error listing captured data:', error)
    return NextResponse.json({ error: 'Failed to list captured data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const {
      bookingSlug,
      duration = 60,
      type = 'area-wide',
      date,
      eventId,
      captureMode = 'full',
    } = body

    // Build search params
    const searchParams: Record<string, string> = {
      duration: String(duration),
    }

    if (date) {
      searchParams.date = date
    }

    // Build overrides for specific configurations
    const overrides: Record<string, unknown> = {}
    if (type) {
      overrides.type = type
    }

    // Enable data capture via environment variable
    const originalCaptureValue = process.env.CAPTURE_TEST_DATA
    process.env.CAPTURE_TEST_DATA = 'true'

    try {
      // Call createPageConfiguration which internally calls fetchPageData
      const result = await createPageConfiguration({
        bookingSlug,
        resolvedParams: searchParams,
        overrides,
        eventId,
        debug: true, // Enable debug mode for more detailed capture
      })

      // Also capture the full page configuration result
      if (captureMode === 'full') {
        const filename = await captureTestData('pageConfiguration', result, {
          endpoint: 'createPageConfiguration',
          params: {
            bookingSlug,
            searchParams,
            overrides,
            eventId,
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Test data captured successfully',
          filename,
          summary: {
            type: result.configuration?.type,
            slotsCount: result.slots?.length || 0,
            hasCurrentEvent: !!result.currentEvent,
            hasMultiDurationSlots: !!result.multiDurationSlots,
            dateRange: {
              start: result.start,
              end: result.end,
            },
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Test data captured (fetchPageData only)',
        summary: {
          type: result.configuration?.type,
          slotsCount: result.slots?.length || 0,
          hasCurrentEvent: !!result.currentEvent,
          hasMultiDurationSlots: !!result.multiDurationSlots,
        },
      })
    } finally {
      // Restore original capture value
      if (originalCaptureValue !== undefined) {
        process.env.CAPTURE_TEST_DATA = originalCaptureValue
      } else {
        delete process.env.CAPTURE_TEST_DATA
      }
    }
  } catch (error) {
    console.error('Error capturing test data:', error)
    return NextResponse.json(
      {
        error: 'Failed to capture test data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
