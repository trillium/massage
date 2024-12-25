import getAccessToken from "@/lib/availability/getAccessToken"

export default async function updateLocation({
  location,
}: {
  location: string
}) {
  const eventId = "01vd8vpsq30jo29j379mritaoo"
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`

  const timeZone = "America/Los_Angeles"

  const now = new Date()
  const start = new Date(now.getTime() - 15 * 60000)
  const end = new Date(now.getTime())

  const startDateTime = start.toISOString()
  const endDateTime = end.toISOString()

  const body = {
    start: {
      dateTime: startDateTime,
      timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone,
    },
    location: location,
  }

  const response = await fetch(apiUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(body),
  })

  const json = await response.json()

  return { body, res: json }
}
