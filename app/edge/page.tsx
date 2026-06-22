import { Metadata } from 'next'
import Link from 'next/link'
import SectionContainer from '@/components/SectionContainer'
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextBase, TextSm, TextLg, TextSmMedium } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import CustomLink from '@/components/Link'
import EdgeRoleHydrator from '@/components/utilities/EdgeRoleHydrator'
import Image from 'next/image'
import { edgeMin } from '@/lib/slugConfigurations/slugs/edge'

export const metadata: Metadata = {
  title: 'Trillium Massage at Edge — Trillium Smith',
  description:
    'Complimentary chair and table massage for Edge community members and team. Book a session or drop in during office hours.',
}

const SITE_URL = 'https://trilliummassage.la'

type EdgeRole = 'attendee' | 'volunteer' | 'team'

function isEdgeRole(v: unknown): v is EdgeRole {
  return v === 'attendee' || v === 'volunteer' || v === 'team'
}

type Props = { searchParams: Promise<{ role?: string }> }

export default async function EdgeLandingPage({ searchParams }: Props) {
  const { role: roleParam } = await searchParams
  const role = isEdgeRole(roleParam) ? roleParam : undefined

  const officeHoursHref = role ? `/edge-office?role=${role}` : '/edge-office'
  const destinationHref = role ? `/edge-destination?role=${role}` : '/edge-destination'

  return (
    <SectionContainer>
      <EdgeRoleHydrator />
      <Box className="mx-auto max-w-2xl px-4 py-10">
        <Stack direction="col" gap={8}>
          <Box className="text-center">
            <H1>Trillium Massage at Edge</H1>
            <TextLg status="secondary" className="mt-3">
              Hi, I&apos;m Trillium Smith — licensed massage therapist, software developer, Voice
              Accessabiltiy Enthusiast. I&apos;m offering complimentary sessions to Edge community
              members and team as a gift to this community!
            </TextLg>
          </Box>

          <Box className="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900">
            <H2 className="mb-4">What I&apos;m offering</H2>
            <Stack direction="col" gap={4}>
              <Box>
                <Link href={officeHoursHref}>
                  <H3 status="primary">Office Hours</H3>
                </Link>
                <TextBase status="secondary" className="mt-1">
                  Chair or table massage during scheduled office hour blocks. Walk-ins welcome, or
                  prebook a time that works for you.
                </TextBase>
                <Stack direction="col" gap={1} className="mt-2">
                  <TextSm status="muted">
                    {`Attendees: ${edgeMin('office', 'attendee')} min complimentary, tip for time above`}
                  </TextSm>
                  <TextSm status="muted">
                    {`Volunteers: ${edgeMin('office', 'volunteer')} min complimentary, tip for time above`}
                  </TextSm>
                </Stack>
              </Box>

              <Box className="border-t border-surface-200 pt-4 dark:border-surface-700">
                <Link href={destinationHref}>
                  <H3 status="primary">Destination Sessions</H3>
                </Link>
                <TextBase status="secondary" className="mt-1">
                  Dedicated session on a massage table at a destination of your choosing. Book at
                  least 2 hours in advance.
                </TextBase>
                <Stack direction="col" gap={1} className="mt-2">
                  <TextSm status="muted">
                    {`Attendees: +${edgeMin('destination', 'attendee')} min bonus on any booking`}
                  </TextSm>
                  <TextSm status="muted">
                    {`Volunteers: +${edgeMin('destination', 'volunteer')} min bonus on any booking`}
                  </TextSm>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Stack direction="col" gap={3}>
            <Link href={officeHoursHref}>
              <Button className="w-full py-4" variant="default" size="lg">
                Book Office Hours
              </Button>
            </Link>
            <Link href={destinationHref}>
              <Button className="w-full py-4" variant="outline" size="lg">
                Book Destination Session
              </Button>
            </Link>
            <Link href="/edge-team">
              <TextSm status="primary" className="text-center hover:underline">
                On the Edge team? Go to your team booking page →
              </TextSm>
            </Link>
          </Stack>

          <Box className="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900">
            <H2 className="mb-4">About me</H2>
            <Stack direction="row" gap={4} align="start" className="mb-4">
              <Box className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border-2 border-primary-500">
                <Image
                  src="/static/images/gallery/_retouched_photo_arms_hat.jpg"
                  alt="Trillium Smith"
                  fill
                  className="object-cover object-[center_20%]"
                />
              </Box>
              <TextBase status="secondary">
                I&apos;m a massage therapist transitioning into software development. I learned to
                code by voice using Talon Voice — I&apos;m an accessibility advocate, open source
                contributor, and voice computing enthusiast.
              </TextBase>
            </Stack>
            <Stack direction="col" gap={2} className="mt-4">
              <TextSm>
                <TextSmMedium as="span">Website: </TextSmMedium>
                <CustomLink
                  href="https://trilliumsmith.com"
                  classes="text-primary-600 hover:underline dark:text-primary-400"
                >
                  trilliumsmith.com
                </CustomLink>
              </TextSm>
              <TextSm>
                <TextSmMedium as="span">Massage booking: </TextSmMedium>
                <CustomLink
                  href={SITE_URL}
                  classes="text-primary-600 hover:underline dark:text-primary-400"
                >
                  trilliummassage.la
                </CustomLink>
              </TextSm>
              <TextSm>
                <TextSmMedium as="span">GitHub: </TextSmMedium>
                <CustomLink
                  href="https://github.com/trillium"
                  classes="text-primary-600 hover:underline dark:text-primary-400"
                >
                  github.com/trillium
                </CustomLink>
              </TextSm>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </SectionContainer>
  )
}
