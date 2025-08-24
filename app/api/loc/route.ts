import { NextRequest, NextResponse } from 'next/server'
import updateLocation from 'lib/availability/updateLocation'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const password = searchParams.get('password')

  if (password !== process.env.UPDATE_LOC_PASSWORD) {
    return new NextResponse(JSON.stringify({ error: 'Access denied.' }), {
      status: 400, // NOT OK status
      headers: {
        'Content-Type': 'application/json', // Indicate the content type
      },
    })
  }

  // Convert searchParams to a plain object
  const paramsObj = Object.fromEntries(searchParams)
  const location = searchParams.get('location')
  const city = searchParams.get('city')
  const zipCode = searchParams.get('zipCode')

  let res
  if (location) {
    res = await updateLocation({ location, city: city || undefined, zipCode: zipCode || undefined })
  } else {
    res = { error: 'No location found on response' }
  }

  const newObj = { ...paramsObj, res }

  // Create a new response with the search parameters as JSON
  return new NextResponse(JSON.stringify(paramsObj), {
    status: 200, // OK status
    headers: {
      'Content-Type': 'application/json', // Indicate the content type
    },
  })
}
