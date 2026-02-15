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
  // Supabase
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
    required: false,
    description: 'Supabase service role key (server-side only, needed for admin operations)',
  },

  // Google OAuth & Calendar
  {
    name: 'GOOGLE_OAUTH_CLIENT_ID',
    required: true,
    description: 'Google OAuth 2.0 client ID',
  },
  {
    name: 'GOOGLE_OAUTH_SECRET',
    required: true,
    description: 'Google OAuth 2.0 client secret',
  },
  {
    name: 'GOOGLE_OAUTH_REFRESH',
    required: true,
    description: 'Google OAuth refresh token',
  },
  {
    name: 'GOOGLE_MAPS_API_KEY',
    required: true,
    description: 'Google Maps API key',
  },
  {
    name: 'GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID',
    required: true,
    description: 'Google Calendar primary event ID',
  },

  // Owner Information
  {
    name: 'OWNER_EMAIL',
    required: true,
    description: 'Business owner email address',
  },
  {
    name: 'OWNER_NAME',
    required: false,
    description: 'Business owner name (falls back to NEXT_PUBLIC_OWNER_NAME)',
  },
  {
    name: 'OWNER_PHONE_NUMBER',
    required: true,
    description: 'Business owner phone number',
  },

  // Site Configuration
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: false,
    description: 'Public site URL (falls back to https://trilliummassage.la)',
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
export function validateEnv(): void {
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

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('\n⚠️  Optional environment variables not set:')
    warnings.forEach((warning) => console.warn(`   ${warning}`))
    console.warn('')
  }

  if (missing.length > 0) {
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
}
