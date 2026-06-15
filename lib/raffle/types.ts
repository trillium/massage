export type Raffle = {
  id: string
  name: string
  status: 'open' | 'closed' | 'drawn'
  is_active: boolean
  created_at: string
  drawn_at: string | null
  expiration_date: string | null
  sms_template_winner: string | null
  sms_template_non_winner: string | null
  upgrade_minutes: number
  booking_link: string | null
}

export type RaffleEntry = {
  id: string
  raffle_id: string
  name: string
  email: string
  phone: string
  zip_code: string | null
  is_local: boolean
  interested_in: string[]
  is_winner: boolean
  excluded: boolean
  created_at: string
  distance_from_90045_mi: number | null
  sms_sent_at: string | null
}

export type InsertEntryData = {
  raffle_id: string
  name: string
  email: string
  phone: string
  is_local: boolean
  zip_code?: string | null
  interested_in: string[]
  distance_from_90045_mi?: number | null
}

export type UpdateEntryData = Partial<
  Pick<
    RaffleEntry,
    | 'excluded'
    | 'is_winner'
    | 'sms_sent_at'
    | 'distance_from_90045_mi'
    | 'name'
    | 'phone'
    | 'is_local'
    | 'zip_code'
    | 'interested_in'
  >
>

export type RaffleStats = {
  totalEntries: number
  uniqueEntries: number
  localCount: number
  nonLocalCount: number
  localPercent: number
  uniqueLocal: number
  uniqueNonLocal: number
  interestedInCounts: Record<string, number>
}

export function computeRaffleStats(entries: RaffleEntry[]): RaffleStats {
  const eligible = entries.filter((e) => !e.excluded)
  const uniqueEmails = new Set(eligible.map((e) => e.email))
  const localCount = eligible.filter((e) => e.is_local).length
  const uniqueLocal = new Set(eligible.filter((e) => e.is_local).map((e) => e.email))
  const uniqueNonLocal = new Set(eligible.filter((e) => !e.is_local).map((e) => e.email))

  const interestedInCounts: Record<string, number> = {}
  for (const entry of eligible) {
    for (const interest of Array.isArray(entry.interested_in) ? entry.interested_in : []) {
      interestedInCounts[interest] = (interestedInCounts[interest] ?? 0) + 1
    }
  }

  return {
    totalEntries: eligible.length,
    uniqueEntries: uniqueEmails.size,
    localCount,
    nonLocalCount: eligible.length - localCount,
    localPercent:
      eligible.length > 0 ? Math.round((uniqueLocal.size / uniqueEmails.size) * 100) : 0,
    uniqueLocal: uniqueLocal.size,
    uniqueNonLocal: uniqueNonLocal.size,
    interestedInCounts,
  }
}
