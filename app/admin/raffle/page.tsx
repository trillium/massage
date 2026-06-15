import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { listRaffles, getEntriesByRaffle, computeRaffleStats } from '@/lib/raffle'
import { CreateRaffleForm } from './CreateRaffleForm'
import { RaffleAdmin } from './RaffleAdmin'
import { RaffleSelector } from './RaffleSelector'
import { H1 } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'
import { TextSmMuted } from '@/components/ui/text'
import Link from 'next/link'

export default async function RafflePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return (
      <Box className="py-4">
        <H1 className="mb-6">{'Raffle'}</H1>
        <TextSmMuted>{'Database unavailable.'}</TextSmMuted>
      </Box>
    )
  }

  const allRaffles = await listRaffles(supabase)

  let raffle = resolvedParams.id
    ? (allRaffles.find((r) => r.id === resolvedParams.id) ?? null)
    : null
  if (!raffle) raffle = allRaffles.find((r) => r.status === 'open') ?? null
  if (!raffle) raffle = allRaffles.find((r) => r.status === 'drawn') ?? null

  if (!raffle) {
    return (
      <Box className="py-4">
        <H1 className="mb-6">{'Raffle'}</H1>
        <Box className="mb-6">
          <CreateRaffleForm />
        </Box>
        <TextSmMuted>{'No active raffle found.'}</TextSmMuted>
      </Box>
    )
  }

  const entries = await getEntriesByRaffle(supabase, raffle.id)
  const stats = computeRaffleStats(entries)

  return (
    <Box className="py-4">
      <H1 className="mb-6">{'Raffle'}</H1>
      <Box className="mb-6">
        <CreateRaffleForm />
      </Box>
      <Box className="mb-6">
        <RaffleSelector
          raffles={allRaffles.map((r) => ({
            id: r.id,
            name: r.name,
            status: r.status,
            is_active: r.is_active,
          }))}
          currentRaffleId={raffle.id}
        />
      </Box>
      <RaffleAdmin raffle={raffle} entries={entries} stats={stats} />
      <Box className="mt-6">
        <Link href="/admin/raffle/winner" className="text-sm text-primary-500 hover:underline">
          {'View winner & SMS messages →'}
        </Link>
      </Box>
    </Box>
  )
}
