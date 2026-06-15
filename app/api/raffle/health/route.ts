import { healthResponse } from '@/lib/health/shared'
import { getRaffleEntryCounts, listRaffles } from '@/lib/raffle'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return healthResponse(
      {
        db: 'unhealthy',
        error: 'Could not connect to database',
        raffles: null,
        active_raffle: null,
        entry_counts: null,
      },
      503
    )
  }

  try {
    const raffles = await listRaffles(supabase)
    const activeRaffle = raffles.find((r) => r.status === 'open') ?? null
    const entryCounts = await getRaffleEntryCounts(supabase)

    const rafflesSummary = raffles.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      is_active: r.is_active,
      created_at: r.created_at,
      entry_count: entryCounts[r.id] ?? 0,
    }))

    return healthResponse({
      db: 'healthy',
      raffle_count: raffles.length,
      active_raffle: activeRaffle
        ? {
            id: activeRaffle.id,
            name: activeRaffle.name,
            entry_count: entryCounts[activeRaffle.id] ?? 0,
          }
        : null,
      raffles: rafflesSummary,
    })
  } catch (error) {
    return healthResponse(
      {
        db: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        raffles: null,
        active_raffle: null,
        entry_counts: null,
      },
      503
    )
  }
}
