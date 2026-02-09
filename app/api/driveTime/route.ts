import { NextRequest, NextResponse } from 'next/server'
import { fetchSingleEvent } from 'lib/fetch/fetchSingleEvent'

function getDefaultEventId(): string {
  const id = process.env.GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID
  if (!id) {
    throw new Error('Required environment variable GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID is not set')
  }
  return id
}

interface DriveTimeRequest {
  eventId?: string
  userLocation?: string
  userCoordinates?: { lat: number; lng: number }
}

interface DriveTimeResponse {
  success: boolean
  driveTimeMinutes?: number
  eventLocation?: string
  userLocation?: string
  error?: string
}

/**
 * Calculate drive time between two locations using Google Maps Distance Matrix API
 * In a real implementation, this would integrate with Google Maps Distance Matrix API
 * or similar service
 */
async function calculateDriveTime(location1: string, location2: string): Promise<number> {
  // Check if Google Maps API key is configured
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn('Google Maps API key not configured, falling back to mock calculation')
    return calculateDriveTimeMock(location1, location2)
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
    url.searchParams.set('origins', location1)
    url.searchParams.set('destinations', location2)
    url.searchParams.set('units', 'imperial') // or 'metric'
    url.searchParams.set('mode', 'driving')
    url.searchParams.set('traffic_model', 'best_guess')
    url.searchParams.set('departure_time', 'now') // For real-time traffic
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (!response.ok || data.status !== 'OK') {
      console.error('Google Maps API error:', data)
      throw new Error(`Google Maps API error: ${data.status || 'Unknown error'}`)
    }

    const element = data.rows?.[0]?.elements?.[0]

    if (!element || element.status !== 'OK') {
      console.error('No route found or invalid locations:', element)
      throw new Error(`No route found: ${element?.status || 'Unknown error'}`)
    }

    // Google returns duration in seconds, convert to minutes
    const durationMinutes =
      Math.ceil(element.duration_in_traffic?.value / 60) || Math.ceil(element.duration.value / 60)

    return durationMinutes
  } catch (error) {
    console.error('Error calling Google Maps API, falling back to mock:', error)
    return calculateDriveTimeMock(location1, location2)
  }
}

/**
 * Fallback mock function when Google Maps API is not available
 */
async function calculateDriveTimeMock(location1: string, location2: string): Promise<number> {
  // Mock calculation based on location strings
  // This is a simplified mock - in reality you'd use a proper distance/time API

  // Simple mock logic based on location similarity/distance indicators
  const loc1Lower = location1.toLowerCase().trim()
  const loc2Lower = location2.toLowerCase().trim()

  // If locations are identical, return 0
  if (loc1Lower === loc2Lower) {
    return 0
  }

  // Mock different drive times based on location patterns
  // This is just for demonstration - replace with real API integration

  // Check if both locations are in the same city/area
  const commonAreas = ['los angeles', 'la', 'hollywood', 'beverly hills', 'santa monica', 'venice']
  const loc1InLA = commonAreas.some((area) => loc1Lower.includes(area))
  const loc2InLA = commonAreas.some((area) => loc2Lower.includes(area))

  if (loc1InLA && loc2InLA) {
    // Same metropolitan area - shorter drive time
    return Math.floor(Math.random() * 30) + 10 // 10-40 minutes
  }

  // Check for specific location patterns to make the mock more realistic
  if (loc1Lower.includes('airport') || loc2Lower.includes('airport')) {
    return Math.floor(Math.random() * 45) + 30 // 30-75 minutes to/from airport
  }

  if (loc1Lower.includes('downtown') || loc2Lower.includes('downtown')) {
    return Math.floor(Math.random() * 35) + 20 // 20-55 minutes to/from downtown
  }

  // Default mock time for different areas
  return Math.floor(Math.random() * 60) + 15 // 15-75 minutes
}

export async function POST(request: NextRequest) {
  try {
    const body: DriveTimeRequest = await request.json()
    const { eventId, userLocation, userCoordinates } = body

    if (!userLocation && !userCoordinates) {
      return NextResponse.json(
        {
          success: false,
          error: 'userLocation or userCoordinates is required',
        } as DriveTimeResponse,
        { status: 400 }
      )
    }

    // Determine which event to use
    const targetEventId = eventId || getDefaultEventId()

    // Fetch the event to get its location
    const event = await fetchSingleEvent(targetEventId)

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: `Event not found with ID: ${targetEventId}`,
        } as DriveTimeResponse,
        { status: 404 }
      )
    }

    const eventLocation = event.location

    if (!eventLocation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event does not have a location specified',
          eventLocation: 'Not specified',
          userLocation: userLocation || `${userCoordinates?.lat},${userCoordinates?.lng}`,
        } as DriveTimeResponse,
        { status: 400 }
      )
    }

    // Use coordinates if provided, otherwise use location string
    const destination = userCoordinates
      ? `${userCoordinates.lat},${userCoordinates.lng}`
      : userLocation!

    // Calculate drive time between the two locations
    const driveTimeMinutes = await calculateDriveTime(eventLocation, destination)

    return NextResponse.json({
      success: true,
      driveTimeMinutes,
      eventLocation,
      userLocation: destination,
    } as DriveTimeResponse)
  } catch (error) {
    console.error('Error calculating drive time:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate drive time',
      } as DriveTimeResponse,
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const eventId = searchParams.get('eventId')
  const userLocation = searchParams.get('userLocation')

  if (!userLocation) {
    return NextResponse.json(
      {
        success: false,
        error: 'userLocation query parameter is required',
      } as DriveTimeResponse,
      { status: 400 }
    )
  }

  try {
    // Determine which event to use
    const targetEventId = eventId || getDefaultEventId()

    // Fetch the event to get its location
    const event = await fetchSingleEvent(targetEventId)

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: `Event not found with ID: ${targetEventId}`,
        } as DriveTimeResponse,
        { status: 404 }
      )
    }

    const eventLocation = event.location

    if (!eventLocation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event does not have a location specified',
          eventLocation: 'Not specified',
          userLocation,
        } as DriveTimeResponse,
        { status: 400 }
      )
    }

    // Calculate drive time between the two locations
    const driveTimeMinutes = await calculateDriveTime(eventLocation, userLocation)

    return NextResponse.json({
      success: true,
      driveTimeMinutes,
      eventLocation,
      userLocation,
    } as DriveTimeResponse)
  } catch (error) {
    console.error('Error calculating drive time:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate drive time',
      } as DriveTimeResponse,
      { status: 500 }
    )
  }
}
