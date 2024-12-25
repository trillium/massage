import getAccessToken from "./getAccessToken" // Reuse existing function to get access token

export async function getEventsBySearchQuery({
  start,
  end,
  query,
}: {
  query: string
  start?: string | Date
  end?: string | Date
}) {
  const accessToken = await getAccessToken()
  const calendarId = "primary" // Use 'primary' for the primary calendar or specify another calendar ID
  const urlBase = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?q=${encodeURIComponent(query)}&orderBy=startTime&singleEvents=true`

  let url = urlBase

  if (start) {
    let timeMin: string

    if (typeof start === "string") {
      timeMin = new Date(start).toISOString()
    } else if (start instanceof Date) {
      timeMin = start.toISOString()
    } else {
      throw new Error("Invalid type for start parameter")
    }

    url += `&timeMin=${encodeURIComponent(timeMin)}`
  }

  if (end) {
    let timeMax: string;
  
    if (typeof end === 'string') {
      timeMax = new Date(end).toISOString();
    } else if (end instanceof Date) {
      timeMax = end.toISOString();
    } else {
      throw new Error('Invalid type for end parameter');
    }
  
    url += `&timeMax=${encodeURIComponent(timeMax)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching events: ${response.statusText}`)
  }

  const data = await response.json()
  return data.items 
}

// Availability will be defined by calendar events called (name)_CONTAINER
// sub events will take up event container time and have (name) in their summary or body
