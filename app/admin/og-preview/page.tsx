/* ds-ignore-file */
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'

export default async function OgPreviewPage() {
  const configs = await fetchSlugConfigurationData()
  const slugs = Object.keys(configs).sort()

  return (
    <SectionContainer>
      <div className="mx-auto max-w-6xl py-8">
        <h1 className="mb-2 text-3xl font-bold">OG Image Preview</h1>
        <p className="mb-8 text-sm text-accent-500">{slugs.length} slugs</p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {slugs.map((slug) => {
            const config = configs[slug]
            const ogUrl = `/${slug}/opengraph-image`
            const bookUrl = `/book/${slug}`
            return (
              <div key={slug} className="overflow-hidden rounded-lg border border-accent-200 dark:border-accent-700">
                <div className="bg-surface-100 px-4 py-2 dark:bg-surface-800">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono text-accent-600 dark:text-accent-400 truncate">{slug}</code>
                    <div className="flex shrink-0 gap-3 text-xs">
                      <Link href={bookUrl} className="text-primary-600 hover:underline">book</Link>
                      <Link href={ogUrl} className="text-primary-600 hover:underline">raw</Link>
                    </div>
                  </div>
                  {config.title && (
                    <p className="mt-1 truncate text-sm font-medium">{config.title}</p>
                  )}
                </div>
                <Link href={ogUrl}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ogUrl}
                    alt={`OG image for ${slug}`}
                    width={1200}
                    height={630}
                    className="w-full"
                    loading="lazy"
                  />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </SectionContainer>
  )
}
