import getAccessToken from '@/lib/availability/getAccessToken'
import { formatDatetimeToString } from '../helpers'

export default async function updateLocation({
  location,
  city,
  zipCode,
}: {
  location: string
  city?: string
  zipCode?: string
}) {
  // cspell:disable-next-line
  const eventId = '01vd8vpsq30jo29j379mritaoo'
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`

  const timeZone = 'America/Los_Angeles'

  const now = new Date()
  const start = new Date(now.getTime() - 15 * 60000)
  const end = new Date(now.getTime())

  const startDateTime = formatDatetimeToString(start)
  const endDateTime = formatDatetimeToString(end)

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
    ...(city ? { city } : {}),
    ...(zipCode ? { zipCode } : {}),
  }

  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(body),
  })

  const json = await response.json()

  return { body, res: json }
}
