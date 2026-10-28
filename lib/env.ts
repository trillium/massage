/**
 * Environment variable validation
 *
 * This module validates all required environment variables at startup.
 * Fails fast with clear error messages if any required variables are missing.
 */

type EnvVar = {
  name: string
  required: boolean
  description: string
}

const ENV_VARS: EnvVar[] = [
  // Supabase — required for auth and tenant operations
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous/public API key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (server-side only, needed for admin operations)',
  },

  // Google OAuth & Calendar
  {
    name: 'GOOGLE_OAUTH_CLIENT_ID',
    required: false,
    description: 'Google OAuth 2.0 client ID',
  },
  {
    name: 'GOOGLE_OAUTH_SECRET',
    required: false,
    description: 'Google OAuth 2.0 client secret',
  },
  {
    name: 'GOOGLE_OAUTH_REFRESH',
    required: false,
    description: 'Google OAuth refresh token',
  },
  {
    name: 'GOOGLE_MAPS_API_KEY',
    required: false,
    description: 'Google Maps API key',
  },
  {
    name: 'GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID',
    required: false,
    description: 'Google Calendar primary event ID',
  },

  // Owner Information
  {
    name: 'OWNER_EMAIL',
    required: false,
    description: 'Business owner email address',
  },
  {
    name: 'OWNER_NAME',
    required: false,
    description: 'Business owner name (falls back to NEXT_PUBLIC_OWNER_NAME)',
  },
  {
    name: 'OWNER_PHONE_NUMBER',
    required: false,
    description: 'Business owner phone number',
  },

  // Site Configuration
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: false,
    description: 'Public site URL (falls back to siteConfig.domain.siteUrl)',
  },

  // Optional Features
  {
    name: 'ADMIN_EMAILS',
    required: false,
    description: 'Comma-separated list of admin email addresses',
  },
  {
    name: 'PUSHOVER_API_KEY',
    required: false,
    description: 'Pushover API key for notifications',
  },
  {
    name: 'PUSHOVER_USER_KEY',
    required: false,
    description: 'Pushover user key for notifications',
  },
  {
    name: 'NEXT_PUBLIC_DISABLE_POSTHOG',
    required: false,
    description: 'Set to "true" to disable PostHog analytics',
  },
  {
    name: 'COOKIE_DOMAIN',
    required: false,
    description: 'Cookie domain for authentication',
  },
  {
    name: 'NEXTAUTH_URL',
    required: false,
    description: 'NextAuth URL for authentication',
  },

  // Square (invoicing) — optional as a group; see validateSquareConfig
  {
    name: 'SQUARE_ACCESS_TOKEN',
    required: false,
    description: 'Square API access token',
  },
  {
    name: 'SQUARE_LOCATION_ID',
    required: false,
    description: 'Square location ID used for orders and invoices',
  },
  {
    name: 'SQUARE_WEBHOOK_SIGNATURE_KEY',
    required: false,
    description: 'Square webhook signature key',
  },
  {
    name: 'SQUARE_WEBHOOK_URL',
    required: false,
    description: 'Exact public Square webhook notification URL',
  },
  {
    name: 'SQUARE_ENVIRONMENT',
    required: false,
    description: 'Square environment: "sandbox" (default) or "production"',
  },

  // Multi-tenant
  {
    name: 'TENANT_SLUG',
    required: true,
    description: 'Postgres schema name for this tenant (e.g. trillium_massage)',
  },
  {
    name: 'NEXT_PUBLIC_TENANT_SLUG',
    required: true,
    description: 'Browser-accessible tenant slug, must match TENANT_SLUG',
  },

  // Development/Testing
  {
    name: 'USE_MOCK_CALENDAR_DATA',
    required: false,
    description: 'Set to "true" to use mock calendar data instead of Google Calendar API',
  },
  {
    name: 'CAPTURE_TEST_DATA',
    required: false,
    description: 'Set to "true" to capture test data',
  },
]

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

/**
 * Validates all environment variables
 * Throws EnvValidationError if any required variables are missing
 */
function classifyEnvVars() {
  const missing: EnvVar[] = []
  const warnings: string[] = []
  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]
    if (!value || value.trim() === '') {
      if (envVar.required) {
        missing.push(envVar)
      } else {
        warnings.push(`Optional env var ${envVar.name} is not set: ${envVar.description}`)
      }
    }
  }
  return { missing, warnings }
}

function warnOptionalEnvVars(warnings: string[]) {
  if (warnings.length === 0 || process.env.NODE_ENV !== 'development') return
  console.warn('\n⚠️  Optional environment variables not set:')
  warnings.forEach((warning) => console.warn(`   ${warning}`))
  console.warn('')
}

function throwIfMissingRequired(missing: EnvVar[]) {
  if (missing.length === 0) return
  const errorMessage = [
    '\n❌ Missing required environment variables:',
    '',
    ...missing.map((envVar) => `   ${envVar.name}: ${envVar.description}`),
    '',
    'Please set these variables in your .env.local file.',
    'See .env.example for reference.',
    '',
  ].join('\n')
  throw new EnvValidationError(errorMessage)
}

function validateTenantConfig(): string[] {
  const warnings: string[] = []
  const tenantSlug = process.env.TENANT_SLUG
  const publicTenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG

  if (tenantSlug && !/^[a-z][a-z0-9_]*$/.test(tenantSlug)) {
    warnings.push(
      `TENANT_SLUG="${tenantSlug}" is not valid snake_case — must match /^[a-z][a-z0-9_]*$/`
    )
  }

  if (tenantSlug && publicTenantSlug && tenantSlug !== publicTenantSlug) {
    warnings.push(
      `TENANT_SLUG="${tenantSlug}" and NEXT_PUBLIC_TENANT_SLUG="${publicTenantSlug}" differ — they should match`
    )
  }

  return warnings
}

const SQUARE_REQUIRED_WHEN_ENABLED = [
  'SQUARE_ACCESS_TOKEN',
  'SQUARE_LOCATION_ID',
  'SQUARE_WEBHOOK_SIGNATURE_KEY',
  'SQUARE_WEBHOOK_URL',
] as const

/**
 * Square is optional, but if any SQUARE_* var is set the whole group must be
 * valid, so a half-configured payment setup fails at startup, not at checkout.
 * Returns a list of problems (empty when valid or entirely unconfigured).
 */
export function validateSquareConfig(env: NodeJS.ProcessEnv = process.env): string[] {
  const names = [...SQUARE_REQUIRED_WHEN_ENABLED, 'SQUARE_ENVIRONMENT']
  const isSet = (n: string) => !!env[n] && env[n]!.trim() !== ''
  if (!names.some(isSet)) return []

  const problems: string[] = []
  for (const name of SQUARE_REQUIRED_WHEN_ENABLED) {
    if (!isSet(name)) problems.push(`${name} is required when Square is configured`)
  }
  const environment = env.SQUARE_ENVIRONMENT?.trim()
  if (environment && environment !== 'sandbox' && environment !== 'production') {
    problems.push(`SQUARE_ENVIRONMENT="${environment}" must be "sandbox" or "production"`)
  }
  if (isSet('SQUARE_WEBHOOK_URL')) {
    try {
      const url = new URL(env.SQUARE_WEBHOOK_URL!)
      if (url.protocol !== 'https:' && environment === 'production') {
        problems.push('SQUARE_WEBHOOK_URL must be https in production')
      }
    } catch {
      problems.push('SQUARE_WEBHOOK_URL is not a valid URL')
    }
  }
  return problems
}

export function validateEnv(): void {
  const { missing, warnings } = classifyEnvVars()
  const squareProblems = validateSquareConfig()
  if (squareProblems.length > 0) {
    throw new EnvValidationError(
      ['\n❌ Invalid Square configuration:', '', ...squareProblems.map((p) => `   ${p}`), ''].join(
        '\n'
      )
    )
  }
  const tenantWarnings = validateTenantConfig()
  warnOptionalEnvVars([...warnings, ...tenantWarnings])
  throwIfMissingRequired(missing)
}

/**
 * Gets a required environment variable
 * Throws an error if the variable is not set
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new EnvValidationError(
      `Required environment variable ${name} is not set. ` +
        `This should have been caught by validateEnv() at startup.`
    )
  }
  return value
}

/**
 * Gets an optional environment variable with a default value
 */
export function getOptionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue
}

// Run validation immediately when this module is imported
// Skip validation during build time (when NEXT_PHASE is set)
// Validate at runtime startup (development and production)
if (typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  // Only validate on server-side at runtime (not in browser, not during build)
  validateEnv()
  import('./startup/provisionTenant').then(({ provisionTenant }) =>
    provisionTenant().catch(console.warn)
  )
}
