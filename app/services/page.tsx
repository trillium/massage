import SectionContainer from '@/components/SectionContainer'
import Image from 'next/image'
import Link from '@/components/Link'

import { services } from '@/data/servicesData'
import type { ServiceTypePriced } from '@/lib/types'

export default function ServicesPage() {
  return (
    <SectionContainer>
      <h1 className="mb-4 text-3xl font-bold">Our Massage Services</h1>
      <p className="mb-8">Explore our range of massage services. Book your session today!</p>
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
    <div id={id} className="rounded-lg border bg-white p-6 shadow-md dark:bg-gray-900">
      <div className="mb-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-md">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
      </div>
      <h2 className="text-primary-600 dark:text-primary-400 mb-2 text-xl font-semibold">{name}</h2>
      <p className="mb-2 text-gray-700 dark:text-gray-300">{description}</p>
      <div className="mb-2 text-gray-600 dark:text-gray-400">
        <span className="font-medium">Duration:</span> {duration.join(' / ')} min
      </div>
      <div className="mb-4 text-gray-600 dark:text-gray-400">
        <span className="font-medium">Price:</span> ${price.join(' / $')}{' '}
        {type === 'split-chair' && <span className="font-medium">per participant</span>}
      </div>
      {type === 'split-chair' && (
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          <span className="font-medium">Booked in 30 minute blocks from 1h - 4h</span>
        </div>
      )}
      {type === 'back-to-back' && (
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          <span className="font-medium">Price and duration is per person</span>
        </div>
      )}
      <div className="flex space-x-4">
        <Link
          href={bookHref}
          className="bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 font-semibold text-white"
        >
          Book Now
        </Link>
        <Link
          href={contactHref}
          className="bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 font-semibold text-white"
        >
          Request Callback
        </Link>
      </div>
    </div>
  )
}
