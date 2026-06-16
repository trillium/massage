import CachedTileMap from '@/components/CachedTileMap'
import clsx from 'clsx'
import { home, site } from '@/app/content'
import { H2 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const serviceAreaBlurb = home.serviceAreaBlurb
const title = "What's the service area?"

export function ServiceAreaSection() {
  return (
    <section className="container flex w-full flex-col items-center gap-8">
      <ServiceArea title={title} text={serviceAreaBlurb} imageLeft />
    </section>
  )
}

type ServiceAreaProps = {
  title: string
  text: string
  imageLeft?: boolean
  imageRight?: boolean
}

function ServiceArea({ text, imageLeft, imageRight }: ServiceAreaProps) {
  let left = true
  if (imageLeft !== undefined) left = true
  if (imageRight !== undefined) left = false

  return (
    <Box className="bg-hero grid w-full grid-flow-row auto-rows-min grid-cols-2 gap-4 overflow-hidden pb-10">
      <H2 className="col-span-2 text-left sm:col-span-1 md:text-center md:text-5xl lg:text-6xl">
        {title || 'Title Missing'}
      </H2>

      <Stack
        direction="row"
        align="center"
        justify="center"
        className={clsx(
          'border-primary-500 relative col-span-2 row-span-3 min-h-96 w-full overflow-hidden rounded-md border-2 sm:col-span-1',
          {
            'order-last sm:order-none': left,
            'order-last sm:order-first': !left,
          }
        )}
      >
        <CachedTileMap
          latitude={site.location.mapLatitude}
          longitude={site.location.mapLongitude}
          zoom={10}
          className="absolute inset-0 border-0"
          style={{ width: '100%', height: '100%' }}
          showMarker={false}
        />
      </Stack>

      <TextBase
        className={clsx(
          'text-md col-span-2 row-span-2 leading-relaxed font-light tracking-wider sm:col-span-1 sm:text-base md:text-left lg:text-xl'
        )}
        data-content="serviceAreaBlurb"
      >
        {text || 'Missing text'}
      </TextBase>
    </Box>
  )
}
