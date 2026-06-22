import SectionContainer from '@/components/SectionContainer'
import Image from 'next/image'
import Link from '@/components/Link'

import { services } from '@/data/servicesData'
import pages from '@/data/pages.json'
import type { ServiceTypePriced } from '@/lib/types'
import { H1, H2 } from '@/components/ui/heading'

import { TextBase, TextSmMedium } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export default function ServicesPage() {
  return (
    <SectionContainer>
      <H1 className="mb-4">{pages.services.heading}</H1>
      <TextBase className="mb-8">{pages.services.intro}</TextBase>
      <Box className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {services.map((service) => (
          <ServiceItem {...service} key={service.name} />
        ))}
      </Box>
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
    <Box id={id} className="rounded-lg border bg-surface-50 p-6 shadow-md dark:bg-surface-900">
      <Box className="mb-4">
        <Box className="relative aspect-square w-full overflow-hidden rounded-md">
          <Image src={image} alt={name} fill className="object-cover" />
        </Box>
      </Box>
      <H2 className="mb-2" status="primary">
        {name}
      </H2>
      <TextBase status="subtle" className="mb-2">
        {description}
      </TextBase>
      <Box className="mb-2 text-accent-600 dark:text-accent-400">
        <TextSmMedium as="span">{pages.services.serviceItem.labels.duration}</TextSmMedium>{' '}
        {duration.join(' / ')}
        {pages.services.serviceItem.durationSuffix}
      </Box>
      <Box className="mb-4 text-accent-600 dark:text-accent-400">
        <TextSmMedium as="span">{pages.services.serviceItem.labels.price}</TextSmMedium>{' '}
        {pages.services.serviceItem.labels.pricePrefix}
        {price.join(' / ' + pages.services.serviceItem.labels.pricePrefix)}{' '}
        {type === 'split-chair' && (
          <TextSmMedium as="span">{pages.services.serviceItem.labels.perParticipant}</TextSmMedium>
        )}
      </Box>
      {type === 'split-chair' && (
        <Box className="mb-4 text-accent-600 dark:text-accent-400">
          <TextSmMedium as="span">{pages.services.serviceItem.notes.splitChair}</TextSmMedium>
        </Box>
      )}
      {type === 'back-to-back' && (
        <Box className="mb-4 text-accent-600 dark:text-accent-400">
          <TextSmMedium as="span">{pages.services.serviceItem.notes.backToBack}</TextSmMedium>
        </Box>
      )}
      <Stack className="space-x-4" direction="row">
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
      </Stack>
    </Box>
  )
}
