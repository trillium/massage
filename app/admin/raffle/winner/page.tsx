import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { listRaffles, getEntriesByRaffle } from '@/lib/raffle'
import { WinnerMessages } from './WinnerMessages'
import { RaffleSelector } from '../RaffleSelector'
import { H1 } from '@/components/ui/heading'
import { TextSmMuted } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'

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

  const allRaffles = await listRaffles(supabase)

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

  const entries = await getEntriesByRaffle(supabase, raffle.id)
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
          />
        </>
      )}
    </Box>
  )
}
