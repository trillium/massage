#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import sootheRatings from '../data/ratings-soothe'
import trilliumRatings from '../data/ratings-trillium'
import airbnbRatings from '../data/ratings-airbnb'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const allReviews = [...sootheRatings, ...trilliumRatings, ...airbnbRatings]

async function seed() {
  console.log(`Seeding ${allReviews.length} reviews...`)

  const rows = allReviews.map((r) => ({
    rating: r.rating,
    date: r.date,
    name: r.name,
    source: r.source,
    comment: r.comment ?? null,
    type: r.type ?? null,
    helpful: r.helpful ?? null,
    spellcheck: r.spellcheck ?? null,
  }))

  const batchSize = 500
  let inserted = 0

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from('reviews').insert(batch)
    if (error) {
      console.error(`Error inserting batch at offset ${i}:`, error)
      process.exit(1)
    }
    inserted += batch.length
    console.log(`  Inserted ${inserted}/${rows.length}`)
  }

  console.log('Done!')
}

seed()
