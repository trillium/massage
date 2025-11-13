import { createContactUrl } from '@/lib/helpers'
import { ALLOWED_DURATIONS as durationStandard, DEFAULT_PRICING } from 'config'
import { GroupType, ServiceType, ServiceTypePriced, LinkType, LinkTypeObject } from '@/lib/types'

const servicesStart: Partial<ServiceType>[] = [
  {
    name: 'General Tarot Reading',
    id: 'general-reading',
    description:
      'A comprehensive tarot reading covering multiple areas of your life. Explore questions about relationships, career, personal growth, and future opportunities with an open-ended spread.',
    duration: durationStandard,
    image: '/static/images/table/table_square_01.webp',
    group: 'table',
    footerHrefText: 'General Reading',
  },
  {
    name: 'Focused Question Reading',
    id: 'focused-reading',
    description:
      'Deep dive into a specific question or situation. Perfect when you need clarity on a particular decision, relationship dynamic, or life challenge.',
    duration: durationStandard,
    image: '/static/images/table/table_square_02.webp',
    group: 'table',
    footerHrefText: 'Focused Reading',
  },
  {
    name: 'Relationship Reading',
    id: 'relationship-reading',
    description:
      'Explore relationship dynamics, compatibility, and potential outcomes. Available for romantic partnerships, friendships, or family relationships.',
    duration: durationStandard,
    image: '/static/images/table/table_square_03.webp',
    group: 'table',
    footerHrefText: 'Relationship Reading',
    type: 'back-to-back',
  },
  {
    name: 'Event Tarot Readings',
    id: 'event-readings',
    description:
      'Tarot readings for your event, party, or corporate gathering. Add a unique, mystical element that your guests will remember. Available for birthdays, weddings, wellness events, and more.',
    duration: [15, 30],
    image: '/static/images/chair/chair_square_07.webp',
    group: 'event',
    footerHrefText: 'Event Readings',
    type: 'split-chair',
    bookHref: '/onsite',
  },
  {
    name: 'Tarot Learning Session',
    id: 'tarot-instructional',
    description:
      'Want to learn to read tarot for yourself? Book a private instructional session to learn card meanings, spreads, and how to develop your intuition. Perfect for beginners or those wanting to deepen their practice.',
    duration: [90],
    image: '/static/images/table/table_square_02.webp',
    group: 'table',
    footerHrefText: 'Tarot Learning Session',
    bookHref: '/instructional',
  },
]

const services: ServiceTypePriced[] = servicesStart.map((service) => {
  if (!service.duration) {
    throw new Error(`Service duration is undefined for service: ${service.name}`)
  }
  if (!service.footerHrefText) {
    throw new Error(`FooterHrefText is undefined for service: ${service.name}`)
  }
  const bookHref = service.bookHref ?? '/book'
  const newPrice = service.duration.map((d) => DEFAULT_PRICING[d])
  return {
    ...service,
    price: newPrice,
    contactHref: createContactUrl(`Callback request for ${service.name}`),
    bookHref,
  } as ServiceTypePriced // Assert that the object is now a complete ServiceType
})

const servicesLinks: LinkTypeObject = servicesStart.reduce((acc, { id, group, footerHrefText }) => {
  if (!group) return acc
  if (!acc[group]) acc[group] = []
  if (!footerHrefText) {
    throw new Error(`text duration is undefined for footerHrefText: ${footerHrefText}`)
  }
  acc[group].push({ href: `/services#${id}`, text: footerHrefText })
  return acc
}, {} as LinkTypeObject)

export { services, servicesLinks }
