/**
 * Build-time env validation for NEXT_PUBLIC_* vars.
 *
 * NEXT_PUBLIC_* vars are baked into the JS bundle at build time. A wrong or
 * placeholder value produces a broken build artifact that ships silently.
 * This script fails loudly before next build can produce that artifact.
 *
 * Run via `prebuild` in package.json — pnpm/npm invoke it automatically.
 */

type Check = {
  name: string
  value: string | undefined
  validate: (v: string) => boolean
  hint: string
}

const checks: Check[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    validate: (v) => /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(v),
    hint: 'must be https://<project-ref>.supabase.co (get it from Supabase → Settings → API)',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    validate: (v) => (v.startsWith('eyJ') && v.length > 100) || v.startsWith('sb_publishable_'),
    hint: 'must be a Supabase anon key (eyJ... JWT or sb_publishable_... new format)',
  },
  {
    name: 'NEXT_PUBLIC_TENANT_SLUG',
    value: process.env.NEXT_PUBLIC_TENANT_SLUG,
    validate: (v) => /^[a-z][a-z0-9_]*$/.test(v),
    hint: 'must be a snake_case identifier (e.g. trillium_massage) — set in Vercel Environment Variables',
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    value: process.env.NEXT_PUBLIC_SITE_URL,
    validate: (v) => /^https?:\/\/.+/.test(v),
    hint: 'must be the full site URL (e.g. https://trilliummassage.la)',
  },
  {
    name: 'NEXT_PUBLIC_OWNER_NAME',
    value: process.env.NEXT_PUBLIC_OWNER_NAME,
    validate: (v) => v.trim().length > 0,
    hint: 'must be the business owner display name (e.g. "Trillium Smith")',
  },
  {
    name: 'NEXT_PUBLIC_POSTHOG_KEY_PROD',
    value: process.env.NEXT_PUBLIC_POSTHOG_KEY_PROD,
    validate: (v) => v.startsWith('phc_'),
    hint: 'must be a PostHog project API key starting with phc_ (get it from PostHog → Project Settings)',
  },
  {
    name: 'NEXT_PUBLIC_POSTHOG_KEY_DEV',
    value: process.env.NEXT_PUBLIC_POSTHOG_KEY_DEV,
    validate: (v) => v.startsWith('phc_'),
    hint: 'must be a PostHog project API key starting with phc_ (get it from PostHog → Project Settings)',
  },
  {
    name: 'NEXT_PUBLIC_DISABLE_POSTHOG',
    value: process.env.NEXT_PUBLIC_DISABLE_POSTHOG,
    validate: (v) => v === 'true' || v === 'false',
    hint: 'must be "true" or "false"',
  },
]

const errors: string[] = []

for (const { name, value, validate, hint } of checks) {
  if (!value) {
    errors.push(`  Missing  ${name}\n           ${hint}`)
  } else if (/[\r\n]/.test(value)) {
    errors.push(
      `  Invalid  ${name} contains a newline character — check for trailing \\n in your env config`
    )
  } else if (!validate(value)) {
    errors.push(`  Invalid  ${name}="${value}"\n           ${hint}`)
  }
}

if (errors.length > 0) {
  console.error('\n❌  Build env validation failed — fix before deploying:\n')
  for (const err of errors) {
    console.error(err)
  }
  console.error('\nSet these in .env.local (local) or Vercel Environment Variables (production).\n')
  process.exit(1)
}

console.log('✓  Build env validated')
