import { config } from 'dotenv'
import { resolve } from 'path'
import { getNextUpcomingEvent } from '@/lib/fetch/getNextUpcomingEvent'
import { fetchAllCalendarEvents } from '@/lib/fetch/fetchContainersByQuery'
import { addHours } from 'date-fns'

config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const now = new Date()
  console.log('\n🔍 Debugging /next page availability')
  console.log('Current time:', now.toISOString())
  console.log('Current time (local):', now.toLocaleString())

  console.log('\n1️⃣ Checking for next upcoming event...')
  const nextEvent = await getNextUpcomingEvent()

  if (nextEvent) {
    console.log('✅ Found next event:', nextEvent.summary)
    console.log('   Event ID:', nextEvent.id)
    console.log('   Start:', nextEvent.start?.dateTime)
    console.log('   End:', nextEvent.end?.dateTime)
    console.log('   Location:', nextEvent.location)

    if (nextEvent.start?.dateTime) {
      const eventStart = new Date(nextEvent.start.dateTime)
      const eventEnd = nextEvent.end?.dateTime ? new Date(nextEvent.end.dateTime) : null

      const isHappeningNow = eventStart <= now && eventEnd && eventEnd > now
      console.log('   Is happening now?', isHappeningNow)

      if (isHappeningNow) {
        console.log('   ⚠️  Event is currently in progress!')
        console.log('   Slots should start after:', eventEnd?.toLocaleString())
      }
    }
  } else {
    console.log('❌ No next event found')
    console.log('   This triggers fallback mode (showing today/tomorrow availability)')
  }

  console.log('\n2️⃣ Checking all events in next 18 hours...')
  const { allEvents } = await fetchAllCalendarEvents({
    searchParams: {},
    options: {
      startDate: now,
      endDate: addHours(now, 18),
    },
  })

  console.log(`Found ${allEvents.length} events total`)

  const eventEvents = allEvents.filter((e) => {
    // Must contain '__EVENT__' in summary OR description
    const hasEventTag = e.summary?.includes('__EVENT__') || e.description?.includes('__EVENT__')
    if (!hasEventTag) {
      return false
    }

    // Must NOT contain 'next-exclude__EVENT__' in summary or description
    if (
      e.summary?.includes('next-exclude__EVENT__') ||
      e.description?.includes('next-exclude__EVENT__')
    ) {
      return false
    }

    return true
  })
  console.log(`Found ${eventEvents.length} __EVENT__ events (excluding next-exclude)`)

  if (eventEvents.length > 0) {
    console.log('\nEvents with __EVENT__:')
    eventEvents.forEach((e, i) => {
      const start = e.start?.dateTime ? new Date(e.start.dateTime) : null
      const end = e.end?.dateTime ? new Date(e.end.dateTime) : null
      const isNow = start && end && start <= now && end > now

      console.log(`\n${i + 1}. ${e.summary}`)
      console.log(`   ID: ${e.id}`)
      console.log(`   Start: ${e.start?.dateTime}`)
      console.log(`   End: ${e.end?.dateTime}`)
      console.log(`   Happening now? ${isNow ? '✅ YES' : '❌ No'}`)
    })
  }

  console.log('\n3️⃣ Analysis:')
  const currentEvent = eventEvents.find((e) => {
    const start = e.start?.dateTime ? new Date(e.start.dateTime) : null
    const end = e.end?.dateTime ? new Date(e.end.dateTime) : null
    return start && end && start <= now && end > now
  })

  if (currentEvent) {
    console.log('❌ BUG DETECTED: There IS a current event happening now!')
    console.log(`   Event: ${currentEvent.summary}`)
    console.log(`   End time: ${currentEvent.end?.dateTime}`)
    console.log(
      `   But getNextUpcomingEvent() ${nextEvent ? 'returned a different event' : "didn't find it"}`
    )
    console.log('\n💡 Slots should not be available until after:', currentEvent.end?.dateTime)
  } else {
    console.log('✅ No current event happening now')
    console.log('   Showing general availability is correct')
  }
}

main().catch(console.error)
