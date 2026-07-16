import { siteConfig } from '@/lib/siteConfig'

function eventSummary({ clientName, duration }: { clientName: string; duration: string }) {
  const suffix = siteConfig.business.name.replace(/\s+/g, '')
  const serviceNoun = siteConfig.business.serviceNoun ?? 'reading'
  return `${duration} minute ${serviceNoun} with ${clientName} - ${suffix}`
}

export default eventSummary
