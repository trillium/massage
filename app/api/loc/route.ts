import { NextRequest, NextResponse } from 'next/server'
import updateLocation from 'lib/availability/updateLocation'

export const dynamic = 'force-dynamic'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const password = searchParams.get('password')

  if (password !== process.env.UPDATE_LOC_PASSWORD) {
    return new NextResponse(JSON.stringify({ error: 'Access denied.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...NO_STORE_HEADERS },
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

  return new NextResponse(JSON.stringify({ ...paramsObj, result: res }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...NO_STORE_HEADERS },
  })
}
