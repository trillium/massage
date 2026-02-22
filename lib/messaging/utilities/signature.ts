import { siteConfig } from '@/lib/siteConfig'

function createAnchorTag(url: string, text: string): string {
  return `<a href="${url}">${text}</a>`
}

const domain = siteConfig.domain.siteUrl.replace(/\/$/, '')

export const parts = [
  siteConfig.business.ownerName,
  process.env.OWNER_PHONE || '',
  siteConfig.business.name,
  createAnchorTag(
    `${domain}/?utm_source=email&utm_medium=signature&utm_campaign=personal_signature`,
    domain.replace(/^https?:\/\//, '')
  ),
]
