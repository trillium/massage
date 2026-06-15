import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { Raffle, RaffleEntry, InsertEntryData, UpdateEntryData } from './types'

type Db = NonNullable<ReturnType<typeof getSupabaseAdminClient>>

// ── Raffle reads ──────────────────────────────────────────────────────────────

export async function listRaffles(db: Db): Promise<Raffle[]> {
  const { data, error } = await db
    .from('raffles' as never)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Raffle[]
}

export async function getRaffleById(db: Db, id: string): Promise<Raffle | null> {
  const { data } = await db
    .from('raffles' as never)
    .select('*')
    .eq('id', id)
    .single()
  return data as Raffle | null
}

export async function getActiveRaffle(db: Db): Promise<Raffle | null> {
  const { data } = await db
    .from('raffles' as never)
    .select('*')
    .eq('is_active' as never, true)
    .limit(1)
    .single()
  return data as Raffle | null
}

export async function getOpenRaffle(db: Db): Promise<Raffle | null> {
  const { data } = await db
    .from('raffles' as never)
    .select('*')
    .eq('status', 'open')
    .limit(1)
    .single()
  return data as Raffle | null
}

export async function getMostRecentDrawnRaffle(db: Db): Promise<Raffle | null> {
  const { data } = await db
    .from('raffles' as never)
    .select('*')
    .eq('status', 'drawn')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as Raffle | null
}

export async function getRaffleEntryCounts(db: Db): Promise<Record<string, number>> {
  const { data } = await db.from('raffle_entries' as never).select('raffle_id')
  const counts: Record<string, number> = {}
  for (const row of (data ?? []) as { raffle_id: string }[]) {
    counts[row.raffle_id] = (counts[row.raffle_id] ?? 0) + 1
  }
  return counts
}

// ── Raffle writes ─────────────────────────────────────────────────────────────

export async function createRaffle(db: Db, name: string): Promise<Raffle> {
  const { data, error } = await db
    .from('raffles' as never)
    .insert({ name, status: 'open' } as never)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Raffle
}

export async function updateRaffle(
  db: Db,
  id: string,
  fields: Record<string, unknown>
): Promise<Raffle> {
  const { data, error } = await db
    .from('raffles' as never)
    .update(fields as never)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Raffle
}

export async function setActiveRaffle(db: Db, id: string): Promise<void> {
  const { error } = await db
    .from('raffles' as never)
    .update({ is_active: false } as never)
    .neq('id', id)
  if (error) throw new Error(error.message)
}

// ── Entry reads ───────────────────────────────────────────────────────────────

export async function getEntriesByRaffle(db: Db, raffleId: string): Promise<RaffleEntry[]> {
  const { data, error } = await db
    .from('raffle_entries' as never)
    .select('*')
    .eq('raffle_id', raffleId)
  if (error) throw new Error(error.message)
  return (data ?? []) as RaffleEntry[]
}

export async function getEntryById(db: Db, id: string): Promise<RaffleEntry | null> {
  const { data } = await db
    .from('raffle_entries' as never)
    .select('*')
    .eq('id', id)
    .single()
  return data as RaffleEntry | null
}

export async function getEntryByEmail(
  db: Db,
  email: string,
  raffleId: string
): Promise<RaffleEntry | null> {
  const { data } = await db
    .from('raffle_entries' as never)
    .select('*')
    .eq('email', email)
    .eq('raffle_id', raffleId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as RaffleEntry | null
}

// ── Entry writes ──────────────────────────────────────────────────────────────

export async function insertEntry(db: Db, data: InsertEntryData): Promise<{ id: string }> {
  const { data: result, error } = await db
    .from('raffle_entries' as never)
    .insert(data as never)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return result as { id: string }
}

export async function updateEntry(db: Db, id: string, fields: UpdateEntryData): Promise<void> {
  const { error } = await db
    .from('raffle_entries' as never)
    .update(fields as never)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteEntry(db: Db, id: string): Promise<void> {
  const { error } = await db
    .from('raffle_entries' as never)
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function clearWinnersForRaffle(db: Db, raffleId: string): Promise<void> {
  const { error } = await db
    .from('raffle_entries' as never)
    .update({ is_winner: false } as never)
    .eq('raffle_id', raffleId)
  if (error) throw new Error(error.message)
}

// ── Composite operations ──────────────────────────────────────────────────────

export async function pickEntryAsWinner(db: Db, entryId: string, raffleId: string): Promise<void> {
  await clearWinnersForRaffle(db, raffleId)
  await updateEntry(db, entryId, { is_winner: true })
  await updateRaffle(db, raffleId, { status: 'drawn', drawn_at: new Date().toISOString() })
}

export async function drawRandomWinner(
  db: Db,
  raffleId: string
): Promise<{ name: string; email: string }> {
  const { data, error } = await db
    .from('raffle_entries' as never)
    .select('name, email')
    .eq('raffle_id', raffleId)
    .eq('excluded', false)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  const entries = (data ?? []) as { name: string; email: string }[]
  if (entries.length === 0) throw new Error('No entries to draw from')

  const unique = new Map<string, { name: string; email: string }>()
  for (const e of entries) if (!unique.has(e.email)) unique.set(e.email, e)

  const candidates = Array.from(unique.values())
  const winner = candidates[Math.floor(Math.random() * candidates.length)]

  await clearWinnersForRaffle(db, raffleId)

  const { error: pickErr } = await db
    .from('raffle_entries' as never)
    .update({ is_winner: true } as never)
    .eq('raffle_id', raffleId)
    .eq('email', winner.email)
  if (pickErr) throw new Error(pickErr.message)

  return winner
}
