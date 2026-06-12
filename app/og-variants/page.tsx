/* ds-ignore-file */ /* content-ok-file */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import OgSlideshow from './OgSlideshow'

export default function OgVariantsPage() {
  const variantsDir = join(process.cwd(), 'app/og-variants')
  const variants = readdirSync(variantsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort()

  return <OgSlideshow variants={variants} />
}
