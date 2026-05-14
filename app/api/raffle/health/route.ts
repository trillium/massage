import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/server'

interface RaffleRow {
  id: string
  name: string
  is_active: boolean
  status: string
  created_at: string
}

interface EntryRow {
  raffle_id: string
}

export async function GET() {
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return NextResponse.json(
      {
        db: 'unhealthy',
        error: 'Could not connect to database',
        raffles: null,
        active_raffle: null,
        entry_counts: null,
      },
      { status: 503 }
    )
  }

  try {
    const { data: rafflesData, error: rafflesError } = await supabase
      .from('raffles' as never)
      .select('id, name, is_active, status, created_at')
      .order('created_at', { ascending: false })

    if (rafflesError) {
      return NextResponse.json(
        {
          db: 'unhealthy',
          error: rafflesError.message,
          raffles: null,
          active_raffle: null,
          entry_counts: null,
        },
        { status: 503 }
      )
    }

    const raffles = (rafflesData ?? []) as RaffleRow[]
    const activeRaffle = raffles.find((r) => r.status === 'open') ?? null

    const { data: entriesData, error: countsError } = await supabase
      .from('raffle_entries' as never)
      .select('raffle_id')

    const entryCounts: Record<string, number> = {}
    if (!countsError && entriesData) {
      for (const row of entriesData as unknown as EntryRow[]) {
        entryCounts[row.raffle_id] = (entryCounts[row.raffle_id] ?? 0) + 1
      }
    }

    const rafflesSummary = raffles.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      is_active: r.is_active,
      created_at: r.created_at,
      entry_count: entryCounts[r.id] ?? 0,
    }))

    return NextResponse.json({
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
    return NextResponse.json(
      {
        db: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        raffles: null,
        active_raffle: null,
        entry_counts: null,
      },
      { status: 500 }
    )
  }
}
