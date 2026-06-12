import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { WinnerMessages } from './WinnerMessages'
import { H1 } from '@/components/ui/heading'
import { TextSmMuted } from '@/components/ui/text'

interface RaffleEntry {
  id: string
  name: string
  email: string
  phone: string
  zip_code: string | null
  interested_in: string[]
  is_winner: boolean
  excluded: boolean
}

export default async function RaffleWinnerPage() {
  const supabase = getSupabaseAdminClient()

  const { data: raffleData } = await supabase!
    .from('raffles' as never)
    .select('*')
    .eq('status', 'drawn')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!raffleData) {
    return (
      <div className="py-4">
        <H1 className="mb-6">Raffle Winner</H1>
        <p className="text-accent-600 dark:text-accent-400">
          No drawn raffle found.{' '}
          <Link href="/admin/raffle" className="text-primary-500 hover:underline">
            Go to Raffle Admin
          </Link>
        </p>
      </div>
    )
  }

  const raffle = raffleData as { id: string; name: string }

  const { data: entriesData } = await supabase!
    .from('raffle_entries' as never)
    .select('*')
    .eq('raffle_id', raffle.id)

  const entries = (entriesData ?? []) as RaffleEntry[]
  const winner = entries.find((e) => e.is_winner) ?? null
  const nonWinners = entries.filter((e) => !e.is_winner && !e.excluded)

  if (!winner) {
    return (
      <div className="py-4">
        <H1 className="mb-6">Raffle Winner</H1>
        <p className="text-accent-600 dark:text-accent-400">
          Raffle &quot;{raffle.name}&quot; is drawn but no winner found.{' '}
          <Link href="/admin/raffle" className="text-primary-500 hover:underline">
            Go to Raffle Admin
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="mb-6 flex items-center justify-between">
        <H1>Raffle Winner</H1>
        <Link
          href="/admin/raffle"
          className="rounded border border-accent-300 px-3 py-1.5 text-sm text-accent-600 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-400 dark:hover:bg-surface-700"
        >
          Back to Raffle
        </Link>
      </div>
      <TextSmMuted className="mb-6">{raffle.name}</TextSmMuted>
      <WinnerMessages winner={winner} nonWinners={nonWinners} expirationDate="2026-05-23" />
    </div>
  )
}
