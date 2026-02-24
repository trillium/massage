import config from './siteConfig.json' with { type: 'json' }

/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: config.business.name,
  author: config.business.ownerName,
  headerTitle: config.business.name,
  description: config.business.description,
  language: config.language,
  siteUrl: config.domain.siteUrl,
  siteRepo: config.domain.siteRepo,
  siteLogo: config.branding.siteLogo,
  socialBanner: config.branding.socialBanner,
  theme: 'system',
  avatar: config.branding.avatar,
  email: config.contact.email,
  occupation: config.business.occupation,
  company: config.business.name,
  location: config.location.display,
  instagram: config.contact.instagram,
  locale: config.locale,
  stickyNav: false,
  analytics: {
    umamiAnalytics: {},
  },
  newsletter: {},
  comments: {},
  search: {
    provider: 'kbar',
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`,
    },
  },
  eventBaseString: config.eventBaseString,
}

export default siteMetadata
