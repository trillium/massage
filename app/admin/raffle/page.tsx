import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { CreateRaffleForm } from './CreateRaffleForm'
import { RaffleAdmin } from './RaffleAdmin'
import { RaffleSelector } from './RaffleSelector'

interface Raffle {
  id: string
  name: string
  status: string
  is_active: boolean
  created_at: string
  drawn_at: string | null
}

interface RaffleEntry {
  id: string
  name: string
  email: string
  phone: string
  zip_code: string | null
  is_local: boolean
  interested_in: string[]
  is_winner: boolean
  excluded: boolean
  created_at: string
}

export default async function RafflePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const resolvedParams = await searchParams
  const supabase = getSupabaseAdminClient()

  const { data: allRafflesData } = await supabase!
    .from('raffles' as never)
    .select('*')
    .order('created_at', { ascending: false })

  const allRaffles = (allRafflesData ?? []) as Raffle[]

  let raffle: Raffle | null = null

  if (resolvedParams.id) {
    raffle = allRaffles.find((r) => r.id === resolvedParams.id) ?? null
  }

  if (!raffle) {
    raffle = allRaffles.find((r) => r.status === 'open') ?? null
  }

  if (!raffle) {
    raffle = allRaffles.find((r) => r.status === 'drawn') ?? null
  }

  if (!raffle) {
    return (
      <div className="py-4">
        <h1 className="mb-6 text-3xl font-bold text-accent-900 dark:text-accent-100">Raffle</h1>
        <div className="mb-6">
          <CreateRaffleForm />
        </div>
        <p className="text-accent-600 dark:text-accent-400">No active raffle found.</p>
      </div>
    )
  }

  const { data: entriesData } = await supabase!
    .from('raffle_entries' as never)
    .select('*')
    .eq('raffle_id', raffle.id)

  const entries = (entriesData ?? []) as RaffleEntry[]
  const stats = computeStats(entries)

  return (
    <div className="py-4">
      <h1 className="mb-6 text-3xl font-bold text-accent-900 dark:text-accent-100">Raffle</h1>
      <div className="mb-6">
        <CreateRaffleForm />
      </div>
      <div className="mb-6">
        <RaffleSelector
          raffles={allRaffles.map((r) => ({
            id: r.id,
            name: r.name,
            status: r.status,
            is_active: r.is_active,
          }))}
          currentRaffleId={raffle.id}
        />
      </div>
      <RaffleAdmin raffle={raffle} entries={entries} stats={stats} />
    </div>
  )
}

function computeStats(entries: RaffleEntry[]) {
  const uniqueEmails = new Set(entries.map((e) => e.email))
  const localCount = entries.filter((e) => e.is_local).length
  const uniqueLocal = new Set(entries.filter((e) => e.is_local).map((e) => e.email))
  const uniqueNonLocal = new Set(entries.filter((e) => !e.is_local).map((e) => e.email))

  const interestedInCounts: Record<string, number> = {}
  for (const entry of entries) {
    const interests = Array.isArray(entry.interested_in) ? entry.interested_in : []
    for (const interest of interests) {
      interestedInCounts[interest] = (interestedInCounts[interest] || 0) + 1
    }
  }

  return {
    totalEntries: entries.length,
    uniqueEntries: uniqueEmails.size,
    localCount,
    nonLocalCount: entries.length - localCount,
    localPercent: entries.length > 0 ? Math.round((uniqueLocal.size / uniqueEmails.size) * 100) : 0,
    uniqueLocal: uniqueLocal.size,
    uniqueNonLocal: uniqueNonLocal.size,
    interestedInCounts,
  }
}
