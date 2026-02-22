import rawConfig from '@/data/siteConfig.json'
import { SiteConfigSchema, type SiteConfig } from './siteConfigSchema'

export const siteConfig: SiteConfig = SiteConfigSchema.parse(rawConfig)
