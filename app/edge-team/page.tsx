import { Metadata } from 'next'
import Link from 'next/link'
import SectionContainer from '@/components/SectionContainer'
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextBase, TextSm, TextLg } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Trillium Massage at Edge — Team Booking',
  description: 'Complimentary chair and table massage for Edge team members.',
}

export default function EdgeTeamLandingPage() {
  return (
    <SectionContainer>
      <Box className="mx-auto max-w-2xl px-4 py-10">
        <Stack direction="col" gap={8}>
          <Box className="text-center">
            <H1>Edge Team — Massage Booking</H1>
            <TextLg status="secondary" className="mt-3">
              Welcome, team member! All sessions on this page are fully complimentary.
            </TextLg>
          </Box>

          <Box className="rounded-xl border border-surface-200 bg-surface-50 p-6 dark:border-surface-700 dark:bg-surface-900">
            <H2 className="mb-4">What&apos;s available</H2>
            <Stack direction="col" gap={4}>
              <Box>
                <Link href="/edge-team-office">
                  <H3 status="primary">Office Hours</H3>
                </Link>
                <TextBase status="secondary" className="mt-1">
                  Chair or table massage during scheduled office hour blocks. Walk-ins welcome.
                </TextBase>
                <Stack direction="col" gap={1} className="mt-2">
                  <TextSm status="muted">All durations (5/10/15/20/30) fully complimentary</TextSm>
                </Stack>
              </Box>

              <Box className="border-t border-surface-200 pt-4 dark:border-surface-700">
                <Link href="/edge-team-private">
                  <H3 status="primary">Private Sessions</H3>
                </Link>
                <TextBase status="secondary" className="mt-1">
                  Dedicated session on a massage table. Book at least 2 hours in advance. Location
                  can be of your choosing.
                </TextBase>
                <Stack direction="col" gap={1} className="mt-2">
                  <TextSm status="muted">60/90/120 minute sessions fully complimentary</TextSm>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Stack direction="col" gap={3}>
            <Link href="/edge-team-office">
              <Button className="w-full py-4" variant="default" size="lg">
                Book Office Hours
              </Button>
            </Link>
            <Link href="/edge-team-private">
              <Button className="w-full py-4" variant="outline" size="lg">
                Book Private Session
              </Button>
            </Link>
            <Link href="/edge">
              <TextSm status="primary" className="text-center hover:underline">
                ← Back to the general Edge page
              </TextSm>
            </Link>
          </Stack>
        </Stack>
      </Box>
    </SectionContainer>
  )
}
