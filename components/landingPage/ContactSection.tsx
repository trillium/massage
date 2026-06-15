import CachedTileMap from '@/components/CachedTileMap'
import ContactForm from '@/components/ContactForm'
import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { createContactUrl } from '@/lib/helpers'
import Link from '@/components/Link'
import { siteConfig } from '@/lib/siteConfig'
import landing from '@/data/landing.json'
import { H2 } from '@/components/ui/heading'
import { Stack } from '@/components/ui/stack'

const { name } = siteConfig.business
const { mapLatitude, mapLongitude, serviceArea } = siteConfig.location
const { heading, callRequestText } = landing.contact

export default function ContactSection() {
  return (
    <section className="dark:bg-grey-950 flex w-full flex-col items-center">
      <div className="container">
        <H2 className="mb-8 text-center md:text-4xl dark:text-white">{heading}</H2>
        <Stack
          className="rounded-lg bg-surface-50 px-4 py-8 shadow sm:px-8 dark:bg-surface-800 dark:shadow-lg"
          direction="col"
          gap={6}
        >
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <ContactForm />
            <Stack className="space-y-4" direction="col" justify="center">
              <H2 className="text-center md:text-4xl dark:text-white">{name}</H2>
              <CachedTileMap
                latitude={mapLatitude}
                longitude={mapLongitude}
                zoom={10}
                className="border-primary-500"
                style={{ width: '100%', height: '400px' }}
                showMarker={false}
              />
              <div>
                <Stack direction="row" align="center" gap={4}>
                  <FaMapMarkerAlt className="text-primary-600 dark:text-primary-400 h-6 w-6" />
                  <span className="dark:text-accent-200">{serviceArea}</span>
                </Stack>
              </div>
              <Stack direction="row" align="center" gap={4}>
                <FaPhoneAlt className="text-primary-600 dark:text-primary-400 h-6 w-6" />
                <Link href={createContactUrl(`Informational Callback Request`)} classes="">
                  <span className="dark:text-accent-200">{callRequestText}</span>
                </Link>
              </Stack>
            </Stack>
          </div>
        </Stack>
      </div>
    </section>
  )
}
