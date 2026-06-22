import CachedTileMap from '@/components/CachedTileMap'
import ContactForm from '@/components/ContactForm'
import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { createContactUrl } from '@/lib/helpers'
import Link from '@/components/Link'
import { siteConfig } from '@/lib/siteConfig'
import landing from '@/data/landing.json'
import { H2 } from '@/components/ui/heading'
import { TextSm } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const { name } = siteConfig.business
const { mapLatitude, mapLongitude, serviceArea } = siteConfig.location
const { heading, callRequestText } = landing.contact

export default function ContactSection() {
  return (
    <section className="dark:bg-grey-950 flex w-full flex-col items-center">
      <Box className="container">
        <H2 className="mb-8 text-center md:text-4xl dark:text-white">{heading}</H2>
        <Stack
          className="rounded-lg bg-surface-50 px-4 py-8 shadow sm:px-8 dark:bg-surface-800 dark:shadow-lg"
          direction="col"
          gap={6}
        >
          <Box className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
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
              <Box>
                <Stack direction="row" align="center" gap={4}>
                  <FaMapMarkerAlt className="text-primary-600 dark:text-primary-400 h-6 w-6" />
                  <TextSm as="span">{serviceArea}</TextSm>
                </Stack>
              </Box>
              <Stack direction="row" align="center" gap={4}>
                <FaPhoneAlt className="text-primary-600 dark:text-primary-400 h-6 w-6" />
                <Link href={createContactUrl(`Informational Callback Request`)} classes="">
                  <TextSm as="span">{callRequestText}</TextSm>
                </Link>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </section>
  )
}
