import { getSupabaseAdminClient } from '@/lib/supabase/server'
import type { ReviewType } from '@/lib/types'

export async function fetchReviews(): Promise<ReviewType[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    rating: row.rating as ReviewType['rating'],
    date: row.date,
    name: row.name,
    source: row.source,
    comment: row.comment ?? undefined,
    type: row.type ?? undefined,
    helpful: row.helpful ?? undefined,
    spellcheck: row.spellcheck ?? undefined,
  }))
}
