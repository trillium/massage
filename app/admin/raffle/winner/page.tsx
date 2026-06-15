import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { listRaffles, getEntriesByRaffle, getRaffleFieldHistory } from '@/lib/raffle'
import type { FieldHistoryEntry } from '@/lib/raffle'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { WinnerMessages } from './WinnerMessages'
import { RaffleSelector } from '../RaffleSelector'
import { H1 } from '@/components/ui/heading'
import { TextSmMuted } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import type { SlugOption } from './WinnerMessageComponents'

export default async function RaffleWinnerPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return (
      <Box className="py-4">
        <H1 className="mb-6">{'Raffle Winner'}</H1>
        <TextSmMuted>{'Database unavailable.'}</TextSmMuted>
      </Box>
    )
  }

  const [allRaffles, slugConfigMap] = await Promise.all([
    listRaffles(supabase),
    fetchSlugConfigurationData(),
  ])

  const slugOptions: SlugOption[] = Object.entries(slugConfigMap)
    .map(([slug, config]) => ({
      slug,
      title: typeof config.title === 'string' ? config.title : slug,
      durationBonus: config.durationBonus ?? null,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug))

  if (allRaffles.length === 0) {
    return (
      <Box className="py-4">
        <H1 className="mb-6">{'Raffle Winner'}</H1>
        <TextSmMuted>
          {'No raffles exist yet. '}
          <Link href="/admin/raffle" className="text-primary-500 hover:underline">
            {'Create one →'}
          </Link>
        </TextSmMuted>
      </Box>
    )
  }

  const raffle =
    allRaffles.find((r) => r.id === id) ??
    allRaffles.find((r) => r.status === 'drawn') ??
    allRaffles[0]

  const [entries, fieldHistory] = await Promise.all([
    getEntriesByRaffle(supabase, raffle.id),
    getRaffleFieldHistory(supabase, raffle.id, [
      'sms_template_winner',
      'sms_template_non_winner',
      'upgrade_minutes',
      'booking_link',
    ]),
  ])
  const winner = entries.find((e) => e.is_winner) ?? null
  const nonWinners = entries.filter((e) => !e.is_winner && !e.excluded)

  return (
    <Box className="py-4">
      <Stack direction="row" align="center" justify="between" className="mb-6">
        <H1>{'Raffle Winner'}</H1>
        <Link
          href="/admin/raffle"
          className="rounded border border-accent-300 px-3 py-1.5 text-sm text-accent-600 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-400 dark:hover:bg-surface-700"
        >
          {'Back to Raffle'}
        </Link>
      </Stack>

      <Box className="mb-6">
        <RaffleSelector
          raffles={allRaffles.map((r) => ({
            id: r.id,
            name: r.name,
            status: r.status,
            is_active: r.is_active,
          }))}
          currentRaffleId={raffle.id}
          basePath="/admin/raffle/winner"
        />
      </Box>

      {!winner ? (
        <TextSmMuted>
          {`"${raffle.name}" has no winner yet. `}
          <Link href="/admin/raffle" className="text-primary-500 hover:underline">
            {'Draw one →'}
          </Link>
        </TextSmMuted>
      ) : (
        <>
          <TextSmMuted className="mb-6">{raffle.name}</TextSmMuted>
          <WinnerMessages
            winner={winner}
            nonWinners={nonWinners}
            expirationDate={raffle.expiration_date}
            raffleName={raffle.name}
            raffleId={raffle.id}
            savedWinnerTemplate={raffle.sms_template_winner}
            savedNonWinnerTemplate={raffle.sms_template_non_winner}
            savedUpgradeMinutes={raffle.upgrade_minutes}
            savedBookingLink={raffle.booking_link}
            slugOptions={slugOptions}
            fieldHistory={fieldHistory}
          />
        </>
      )}
    </Box>
  )
}
