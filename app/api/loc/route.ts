import { NextRequest, NextResponse } from "next/server"
import updateLocation from "@/lib/availability/updateLocation"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  console.log("🔗", searchParams)

  const password = searchParams.get("password")

  if (password !== process.env.UPDATE_LOC_PASSWORD) {
    return new NextResponse(JSON.stringify({ error: "Access denied." }), {
      status: 400, // NOT OK status
      headers: {
        "Content-Type": "application/json", // Indicate the content type
      },
    })
  }

  // Convert searchParams to a plain object
  const paramsObj = Object.fromEntries(searchParams)
  const location = searchParams.get("location")

  let res
  if (location) {
    res = await updateLocation({ location })
  } else {
    res = { error: "No location found on response"}
  }

  const newObj = { ...paramsObj, res }

  console.log(newObj)
  // Create a new response with the search parameters as JSON
  return new NextResponse(JSON.stringify(paramsObj), {
    status: 200, // OK status
    headers: {
      "Content-Type": "application/json", // Indicate the content type
    },
  })
}
