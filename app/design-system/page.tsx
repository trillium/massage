/* ds-ignore-file */ /* content-ok-file */
import SectionContainer from '@/components/SectionContainer'
import { H1 } from '@/components/ui/heading'
import { ColorTokens } from './sections/ColorTokens'
import { TypographyScale } from './sections/TypographyScale'
import { EnforcementRules } from './sections/EnforcementRules'
import { OptOuts } from './sections/OptOuts'
import { InteractiveComponents } from './sections/InteractiveComponents'
import { LayoutComponents } from './sections/LayoutComponents'
import { TypographyComponents } from './sections/TypographyComponents'

export default function DesignSystemPage() {
  return (
    <SectionContainer>
      <div className="mx-auto max-w-5xl py-10">
        <div className="mb-10">
          <H1 className="text-3xl font-bold text-accent-900 dark:text-accent-100">Design System</H1>
          <p className="mt-2 text-sm text-accent-500">
            Token reference, enforcement rules, and opt-out directives for massage.la
          </p>
        </div>

        <ColorTokens />
        <TypographyScale />
        <EnforcementRules />
        <OptOuts />
        <InteractiveComponents />
        <LayoutComponents />
        <TypographyComponents />
      </div>
    </SectionContainer>
  )
}
