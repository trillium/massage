import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import { allClientSlugs } from 'contentlayer/generated'
import SectionContainer from '@/components/SectionContainer'
import PageTitle from '@/components/PageTitle'
import { notFound } from 'next/navigation'

export default function ClientSlugPreview() {
  const clientSlug = allClientSlugs.find((s) => s.slug === 'airbnb-sample')

  if (!clientSlug) {
    return notFound()
  }

  // Inject propertyName into MDX code by replacing template variables
  const processedCode = clientSlug.body.code.replace(
    /\{\{propertyName\}\}/g,
    clientSlug.propertyName || 'Your Property'
  )

  return (
    <SectionContainer>
      <article className="space-y-8">
        <div className="border-b border-gray-200 pb-8 dark:border-gray-800">
          <PageTitle>{clientSlug.title}</PageTitle>
          {clientSlug.clientName && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              For: {clientSlug.clientName}
            </p>
          )}
          {clientSlug.metaDescription && (
            <p className="text-gray-700 dark:text-gray-300">{clientSlug.metaDescription}</p>
          )}
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <MDXLayoutRenderer code={processedCode} components={components} />
        </div>
      </article>
    </SectionContainer>
  )
}
