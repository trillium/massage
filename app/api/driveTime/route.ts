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
  estimated?: boolean
  eventLocation?: string
  userLocation?: string
  error?: string
}

/**
 * Calculate drive time between two locations using Google Maps Distance Matrix API
 * In a real implementation, this would integrate with Google Maps Distance Matrix API
 * or similar service
 */
async function calculateDriveTime(
  location1: string,
  location2: string
): Promise<{ minutes: number; estimated: boolean }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn('Google Maps API key not configured, using estimate')
    return { minutes: calculateDriveTimeMock(location1, location2), estimated: true }
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

    return { minutes: durationMinutes, estimated: false }
  } catch (error) {
    console.error('Error calling Google Maps API:', error)
    throw error
  }
}

function calculateDriveTimeMock(location1: string, location2: string): number {
  const loc1Lower = location1.toLowerCase().trim()
  const loc2Lower = location2.toLowerCase().trim()

  if (loc1Lower === loc2Lower) return 0

  const laAreas = ['los angeles', 'la', 'hollywood', 'beverly hills', 'santa monica', 'venice']
  const loc1InLA = laAreas.some((area) => loc1Lower.includes(area))
  const loc2InLA = laAreas.some((area) => loc2Lower.includes(area))

  if (loc1InLA && loc2InLA) return 25
  if (loc1Lower.includes('airport') || loc2Lower.includes('airport')) return 45
  if (loc1Lower.includes('downtown') || loc2Lower.includes('downtown')) return 35
  return 40
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
    const result = await calculateDriveTime(eventLocation, destination)

    return NextResponse.json({
      success: true,
      driveTimeMinutes: result.minutes,
      estimated: result.estimated,
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

    const result = await calculateDriveTime(eventLocation, userLocation)

    return NextResponse.json({
      success: true,
      driveTimeMinutes: result.minutes,
      estimated: result.estimated,
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
