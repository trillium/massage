/* ds-ignore-file */
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import SectionContainer from '@/components/SectionContainer'
import OgPreviewGrid from './OgPreviewGrid'

export default async function OgPreviewPage() {
  const configs = await fetchSlugConfigurationData()
  const slugs = Object.keys(configs).sort()

  return (
    <SectionContainer>
      <div className="mx-auto max-w-6xl py-8">
        <h1 className="mb-6 text-3xl font-bold">OG Image Preview</h1>
        <OgPreviewGrid slugs={slugs} configs={configs} />
      </div>
    </SectionContainer>
  )
}
