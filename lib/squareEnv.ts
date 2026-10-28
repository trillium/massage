/** Square (invoicing) env validation: optional as a group, strict once any SQUARE_* var is set. */
const SQUARE_REQUIRED_WHEN_ENABLED = [
  'SQUARE_ACCESS_TOKEN',
  'SQUARE_LOCATION_ID',
  'SQUARE_WEBHOOK_SIGNATURE_KEY',
  'SQUARE_WEBHOOK_URL',
] as const

const isSet = (env: NodeJS.ProcessEnv, n: string) => !!env[n] && env[n]!.trim() !== ''

function webhookUrlProblem(env: NodeJS.ProcessEnv): string | null {
  try {
    const url = new URL(env.SQUARE_WEBHOOK_URL!)
    const prod = env.SQUARE_ENVIRONMENT?.trim() === 'production'
    return url.protocol !== 'https:' && prod
      ? 'SQUARE_WEBHOOK_URL must be https in production'
      : null
  } catch {
    return 'SQUARE_WEBHOOK_URL is not a valid URL'
  }
}

/**
 * Square is optional, but if any SQUARE_* var is set the whole group must be
 * valid, so a half-configured payment setup fails at startup, not at checkout.
 * Returns a list of problems (empty when valid or entirely unconfigured).
 */
function validateSquareConfig(env: NodeJS.ProcessEnv): string[] {
  if (![...SQUARE_REQUIRED_WHEN_ENABLED, 'SQUARE_ENVIRONMENT'].some((n) => isSet(env, n))) return []

  const problems = SQUARE_REQUIRED_WHEN_ENABLED.filter((n) => !isSet(env, n)).map(
    (n) => `${n} is required when Square is configured`
  )
  const environment = env.SQUARE_ENVIRONMENT?.trim()
  if (environment && environment !== 'sandbox' && environment !== 'production') {
    problems.push(`SQUARE_ENVIRONMENT="${environment}" must be "sandbox" or "production"`)
  }
  const urlProblem = isSet(env, 'SQUARE_WEBHOOK_URL') ? webhookUrlProblem(env) : null
  return urlProblem ? [...problems, urlProblem] : problems
}

/** Formatted startup error for an invalid Square config, or null when valid. */
export function squareConfigError(env: NodeJS.ProcessEnv = process.env): string | null {
  const problems = validateSquareConfig(env)
  if (problems.length === 0) return null
  return ['\n❌ Invalid Square configuration:', '', ...problems.map((p) => `   ${p}`), ''].join(
    '\n'
  )
}
