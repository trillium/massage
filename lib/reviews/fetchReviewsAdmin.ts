import { getSupabaseAdminClient } from '@/lib/supabase/server'

export interface AdminReview {
  id: number
  name: string
  rating: number
  date: string
  source: string
  comment?: string
  type?: string
}

export async function fetchReviewsAdmin(): Promise<AdminReview[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, rating, date, source, comment, type')
    .order('date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    date: row.date,
    name: row.name,
    source: row.source,
    comment: row.comment ?? undefined,
    type: row.type ?? undefined,
  }))
}
