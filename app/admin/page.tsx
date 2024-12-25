import { getEventsBySearchQuery } from "@/lib/availability/getEventsBySearchQuery"
import ClientPage from "./ClientPage"
import { GoogleCalendarV3Event } from "@/lib/types"

export default async function Page() {
  const events: GoogleCalendarV3Event[] = await getEventsBySearchQuery({
    query: "massage",
    start: "2022-10-14T19:30:00-07:00",
  })
  return <ClientPage events={events.reverse()} />
}
