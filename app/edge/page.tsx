/* ds-ignore-file */
import { Metadata } from 'next'
import Link from 'next/link'
import SectionContainer from '@/components/SectionContainer'
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextBase, TextSm, TextLg } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import EdgeRoleHydrator from '@/components/utilities/EdgeRoleHydrator'

export const metadata: Metadata = {
  title: 'Trillium Massage at Edge — Trillium Smith',
  description:
    'Complimentary chair and table massage for Edge community members and team. Book a session or drop in during office hours.',
}

const SITE_URL = 'https://trilliummassage.la'

type EdgeRole = 'community' | 'team'

function isEdgeRole(v: unknown): v is EdgeRole {
  return v === 'community' || v === 'team'
}

type Props = { searchParams: Promise<{ role?: string }> }

export default async function EdgeLandingPage({ searchParams }: Props) {
  const { role: roleParam } = await searchParams
  const role = isEdgeRole(roleParam) ? roleParam : undefined

  const officeHoursHref = role ? `/edge-office-hours?role=${role}` : '/edge-office-hours'
  const privateHref = role ? `/edge-private?role=${role}` : '/edge-private'

  return (
    <SectionContainer>
      <EdgeRoleHydrator />
      <Box className="mx-auto max-w-2xl px-4 py-10">
        <Stack direction="col" gap={8}>
          <Box className="text-center">
            <H1>Free Massage at Edge</H1>
            <TextLg className="mt-3 text-accent-600 dark:text-accent-300">
              Hi, I&apos;m Trillium Smith — licensed massage therapist and software developer.
              I&apos;m offering complimentary sessions to Edge community members and team as a gift
              to this community.
            </TextLg>
          </Box>

          <Box className="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900">
            <H2 className="mb-4">What I&apos;m offering</H2>
            <Stack direction="col" gap={4}>
              <Box>
                <H3 status="primary">Office Hours — drop in, no wait</H3>
                <TextBase className="mt-1 text-accent-600 dark:text-accent-400">
                  Chair or table massage during scheduled office hour blocks. Zero lead time — just
                  walk up and book the next available slot.
                </TextBase>
                <Stack direction="col" gap={1} className="mt-2">
                  <TextSm className="text-accent-500">Community members: 15 min standard</TextSm>
                  <TextSm className="text-accent-500">Volunteers and team: 30 min standard</TextSm>
                  <TextSm className="text-accent-500">Longer sessions available for all</TextSm>
                </Stack>
              </Box>

              <Box className="border-t border-surface-200 pt-4 dark:border-surface-700">
                <H3 status="primary">Private Sessions — table massage</H3>
                <TextBase className="mt-1 text-accent-600 dark:text-accent-400">
                  A quieter, dedicated session on a massage table. Book at least 2 hours in advance.
                  Use the &ldquo;request sooner&rdquo; option if you&apos;d like to be on a waitlist
                  for an earlier slot.
                </TextBase>
                <Stack direction="col" gap={1} className="mt-2">
                  <TextSm className="text-accent-500">Community members: 30 min standard</TextSm>
                  <TextSm className="text-accent-500">Volunteers and team: 60 min standard</TextSm>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Stack direction="col" gap={3}>
            <Link href={officeHoursHref}>
              <Button className="w-full py-4 text-base" variant="default" size="lg">
                Book Office Hours
              </Button>
            </Link>
            <Link href={privateHref}>
              <Button className="w-full py-4 text-base" variant="outline" size="lg">
                Book Private Session
              </Button>
            </Link>
          </Stack>

          <Box className="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900">
            <H2 className="mb-2">About me</H2>
            <TextBase className="text-accent-600 dark:text-accent-400">
              I&apos;m a massage therapist transitioning into software development. I learned to
              code by voice using Talon Voice — I&apos;m an accessibility advocate, open source
              contributor, and voice computing enthusiast.
            </TextBase>
            <Stack direction="col" gap={2} className="mt-4">
              <TextSm>
                <span className="font-medium">Website: </span>
                <a
                  href="https://trilliumsmith.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline dark:text-primary-400"
                >
                  trilliumsmith.com
                </a>
              </TextSm>
              <TextSm>
                <span className="font-medium">Massage booking: </span>
                <a
                  href={SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline dark:text-primary-400"
                >
                  trilliummassage.la
                </a>
              </TextSm>
              <TextSm>
                <span className="font-medium">GitHub: </span>
                <a
                  href="https://github.com/trillium"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline dark:text-primary-400"
                >
                  github.com/trillium
                </a>
              </TextSm>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </SectionContainer>
  )
}
