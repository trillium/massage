import { siteConfig } from '@/lib/siteConfig'

function eventSummary({ clientName, duration }: { clientName: string; duration: string }) {
  const suffix = siteConfig.business.name.replace(/\s+/g, '')
  return `${duration} minute massage with ${clientName} - ${suffix}`
}

export default eventSummary
