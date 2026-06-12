import SectionContainer from '@/components/SectionContainer'
import Image from 'next/image'
import Link from '@/components/Link'

import { services } from '@/data/servicesData'
import pages from '@/data/pages.json'
import type { ServiceTypePriced } from '@/lib/types'

export default function ServicesPage() {
  return (
    <SectionContainer>
      <h1 className="mb-4 text-3xl font-bold">{pages.services.heading}</h1>
      <p className="mb-8">{pages.services.intro}</p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {services.map((service) => (
          <ServiceItem {...service} key={service.name} />
        ))}
      </div>
    </SectionContainer>
  )
}

function ServiceItem({
  duration,
  price,
  id,
  image,
  name,
  description,
  type,
  bookHref,
  contactHref,
}: ServiceTypePriced) {
  return (
    <div id={id} className="rounded-lg border bg-surface-50 p-6 shadow-md dark:bg-surface-900">
      <div className="mb-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-md">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
      </div>
      <h2 className="text-primary-600 dark:text-primary-400 mb-2 text-xl font-semibold">{name}</h2>
      <p className="mb-2 text-accent-700 dark:text-accent-300">{description}</p>
      <div className="mb-2 text-accent-600 dark:text-accent-400">
        <span className="font-medium">{pages.services.serviceItem.labels.duration}</span>{' '}
        {duration.join(' / ')}
        {pages.services.serviceItem.durationSuffix}
      </div>
      <div className="mb-4 text-accent-600 dark:text-accent-400">
        <span className="font-medium">{pages.services.serviceItem.labels.price}</span>{' '}
        {pages.services.serviceItem.labels.pricePrefix}
        {price.join(' / ' + pages.services.serviceItem.labels.pricePrefix)}{' '}
        {type === 'split-chair' && (
          <span className="font-medium">{pages.services.serviceItem.labels.perParticipant}</span>
        )}
      </div>
      {type === 'split-chair' && (
        <div className="mb-4 text-accent-600 dark:text-accent-400">
          <span className="font-medium">{pages.services.serviceItem.notes.splitChair}</span>
        </div>
      )}
      {type === 'back-to-back' && (
        <div className="mb-4 text-accent-600 dark:text-accent-400">
          <span className="font-medium">{pages.services.serviceItem.notes.backToBack}</span>
        </div>
      )}
      <div className="flex space-x-4">
        <Link
          href={bookHref}
          className="bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 font-semibold text-white"
        >
          {pages.services.buttons.book}
        </Link>
        <Link
          href={contactHref}
          className="bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 font-semibold text-white"
        >
          {pages.services.buttons.contact}
        </Link>
      </div>
    </div>
  )
}
