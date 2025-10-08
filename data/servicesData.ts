import { createContactUrl } from '@/lib/helpers'
import { ALLOWED_DURATIONS as durationStandard, DEFAULT_PRICING } from 'config'
import { GroupType, ServiceType, ServiceTypePriced, LinkType, LinkTypeObject } from '@/lib/types'

const servicesStart: Partial<ServiceType>[] = [
  {
    name: 'Swedish Massage',
    id: 'swedish-massage',
    description:
      'A relaxing full-body massage using gentle to medium pressure to promote relaxation and improve circulation.',
    duration: durationStandard,
    image: '/static/images/table/table_square_01.webp',
    group: 'table',
    footerHrefText: 'Swedish Massage',
  },
  {
    name: 'Deep Tissue Massage',
    id: 'deep-tissue',
    description:
      'Targets deeper layers of muscle and connective tissue to relieve chronic pain and tension.',
    duration: durationStandard,
    image: '/static/images/table/table_square_02.webp',
    group: 'table',
    footerHrefText: 'Deep Tissue',
  },
  {
    name: 'Back-to-Back Couples Massage',
    id: 'back-to-back',
    description: 'Happy to do sessions back to back, for up to 4 guests at a time.',
    duration: durationStandard,
    image: '/static/images/table/table_square_03.webp',
    group: 'table',
    footerHrefText: 'Back-to-Back Sessions',
    type: 'back-to-back',
  },
  {
    name: 'Onsite/Corporate Massage',
    id: 'onsite-chair',
    description:
      'Chair or table massage for your office or event. Boost morale and wellness at work.',
    duration: [15, 30],
    image: '/static/images/chair/chair_square_07.webp',
    group: 'event',
    footerHrefText: 'Onsite Chair Massage',
    type: 'split-chair',
    bookHref: '/onsite',
  },
  {
    name: 'Massage Therapy Instructional',
    id: 'massage-instructional',
    description:
      'Ever wanted to learn to give a relaxing, effective massage? Book a private hands-on workshop for two in your home! This in-home workshop is designed for two people, but can support groups as well.',
    duration: [90],
    image: '/static/images/table/table_square_02.webp',
    group: 'table',
    footerHrefText: 'Massage Therapy Instructional',
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
