const PRODUCTION_ORIGIN = 'https://trilliummassage.la'

export function getOriginFromHeaders(headers: Headers): string {
  return (
    headers.get('origin') ||
    (headers.get('host') ? `https://${headers.get('host')}` : null) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    PRODUCTION_ORIGIN
  )
}
