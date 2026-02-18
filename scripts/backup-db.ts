#!/usr/bin/env tsx

/**
 * Database backup script — pushes Supabase tables directly to a private GitHub repo.
 * Skips if data hasn't changed since last backup (compares SHA with existing file).
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — Supabase access
 *   GITHUB_BACKUP_TOKEN — GitHub PAT with repo scope
 *   GITHUB_BACKUP_REPO  — e.g. "trillium/massage-backups"
 *
 * Usage: tsx scripts/backup-db.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const githubToken = process.env.GITHUB_BACKUP_TOKEN
const githubRepo = process.env.GITHUB_BACKUP_REPO

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!githubToken || !githubRepo) {
  console.error('Missing GITHUB_BACKUP_TOKEN or GITHUB_BACKUP_REPO')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const GITHUB_API = `https://api.github.com/repos/${githubRepo}/contents`

async function fetchAllTables() {
  const { data: reviews, error: reviewsErr } = await supabase
    .from('reviews')
    .select('*')
    .order('id', { ascending: true })

  if (reviewsErr) throw new Error(`reviews: ${reviewsErr.message}`)

  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (profilesErr) throw new Error(`profiles: ${profilesErr.message}`)

  const { data: adminEmails, error: adminErr } = await supabase
    .from('admin_emails')
    .select('*')
    .order('email', { ascending: true })

  if (adminErr) throw new Error(`admin_emails: ${adminErr.message}`)

  return { reviews: reviews ?? [], profiles: profiles ?? [], admin_emails: adminEmails ?? [] }
}

async function getExistingSha(filePath: string): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/${filePath}`, {
    headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.sha
}

async function pushFile(filePath: string, content: string, message: string, sha: string | null) {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString('base64'),
  }
  if (sha) body.sha = sha

  const res = await fetch(`${GITHUB_API}/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${githubToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status} ${await res.text()}`)
}

async function getExistingContent(filePath: string): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/${filePath}`, {
    headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`)
  const data = await res.json()
  return Buffer.from(data.content, 'base64').toString('utf-8')
}

async function main() {
  const tables = await fetchAllTables()

  const payload = {
    timestamp: new Date().toISOString(),
    counts: {
      reviews: tables.reviews.length,
      profiles: tables.profiles.length,
      admin_emails: tables.admin_emails.length,
    },
    tables,
  }

  // Strip timestamp for comparison — we only care if data changed
  const dataForComparison = JSON.stringify({ counts: payload.counts, tables: payload.tables })

  // Check existing backup
  const existing = await getExistingContent('backup.json')
  if (existing) {
    try {
      const parsed = JSON.parse(existing)
      const existingData = JSON.stringify({ counts: parsed.counts, tables: parsed.tables })
      if (existingData === dataForComparison) {
        console.log('No changes since last backup, skipping.')
        return
      }
    } catch {
      // Existing file is corrupt or different format — overwrite
    }
  }

  const content = JSON.stringify(payload, null, 2)
  const sha = await getExistingSha('backup.json')
  const date = new Date().toISOString().slice(0, 10)

  await pushFile(
    'backup.json',
    content,
    `backup ${date}: ${tables.reviews.length} reviews, ${tables.profiles.length} profiles`,
    sha
  )

  console.log(`Backup pushed to ${githubRepo}/backup.json`)
  console.log(
    `  reviews: ${tables.reviews.length}, profiles: ${tables.profiles.length}, admin_emails: ${tables.admin_emails.length}`
  )
}

main().catch((err) => {
  console.error('Backup failed:', err)
  process.exit(1)
})
