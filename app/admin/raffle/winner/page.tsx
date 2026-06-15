import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { getMostRecentDrawnRaffle, getEntriesByRaffle } from '@/lib/raffle'
import { WinnerMessages } from './WinnerMessages'
import { H1 } from '@/components/ui/heading'
import { TextSmMuted } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'

export default async function RaffleWinnerPage() {
  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return (
      <Box className="py-4">
        <H1 className="mb-6">{'Raffle Winner'}</H1>
        <TextSmMuted>{'Database unavailable.'}</TextSmMuted>
      </Box>
    )
  }

  const raffle = await getMostRecentDrawnRaffle(supabase)

  if (!raffle) {
    return (
      <Box className="py-4">
        <H1 className="mb-6">{'Raffle Winner'}</H1>
        <TextSmMuted>
          {'No drawn raffle found. '}
          <Link href="/admin/raffle" className="text-primary-500 hover:underline">
            {'Go to Raffle Admin'}
          </Link>
        </TextSmMuted>
      </Box>
    )
  }

  const entries = await getEntriesByRaffle(supabase, raffle.id)
  const winner = entries.find((e) => e.is_winner) ?? null
  const nonWinners = entries.filter((e) => !e.is_winner && !e.excluded)

  if (!winner) {
    return (
      <Box className="py-4">
        <H1 className="mb-6">{'Raffle Winner'}</H1>
        <TextSmMuted>
          {`Raffle "${raffle.name}" is drawn but no winner found. `}
          <Link href="/admin/raffle" className="text-primary-500 hover:underline">
            {'Go to Raffle Admin'}
          </Link>
        </TextSmMuted>
      </Box>
    )
  }

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
      <TextSmMuted className="mb-6">{raffle.name}</TextSmMuted>
      <WinnerMessages
        winner={winner}
        nonWinners={nonWinners}
        expirationDate={raffle.expiration_date}
        raffleName={raffle.name}
      />
    </Box>
  )
}
