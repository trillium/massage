import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import { allClientSlugs } from 'contentlayer/generated'
import SectionContainer from '@/components/SectionContainer'
import PageTitle from '@/components/PageTitle'
import { notFound } from 'next/navigation'

/**
 * Template replacement function for client slug MDX
 * Replaces {{variable}} placeholders with actual values
 */
function replaceTemplateVars(code: string, data: Record<string, string>): string {
  let result = code
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  })
  return result
}

export default function ClientSlugPreview() {
  const clientSlug = allClientSlugs.find((s) => s.slug === 'airbnb-sample')

  if (!clientSlug) {
    return notFound()
  }

  // Replace template variables in the compiled code
  const templateData = {
    propertyName: clientSlug.propertyName || 'Your Property',
  }
  const processedCode = replaceTemplateVars(clientSlug.body.code, templateData)

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
