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

  return (
    <SectionContainer>
      <article className="space-y-8">
        <div>
          <PageTitle>{clientSlug.title}</PageTitle>
          {clientSlug.clientName && (
            <p className="text-lg text-gray-600">For: {clientSlug.clientName}</p>
          )}
          {clientSlug.metaDescription && (
            <p className="text-gray-700">{clientSlug.metaDescription}</p>
          )}
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <MDXLayoutRenderer code={clientSlug.body.code} components={components} />
        </div>
      </article>
    </SectionContainer>
  )
}
