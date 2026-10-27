/* ds-ignore-file */
import { TextSm } from '@/components/ui/text'

import { Section, SectionTitle, Table } from './ProposalParts'

export function OfferSection() {
  return (
    <Section>
      <SectionTitle>The Offer</SectionTitle>
      <Table
        headers={['', 'Proposed']}
        rows={[
          [<strong key="f">Format</strong>, 'Table massage therapy at the employee’s home'],
          [<strong key="s">Recommended session</strong>, '90 minutes per employee'],
          [<strong key="r">Rate</strong>, '$150 per hour of client service'],
          [<strong key="c">Credit per 90-minute session</strong>, '$225 toward my dental bill'],
          [<strong key="l">Location</strong>, 'Employee’s home — I travel to them'],
          [<strong key="d">Scheduling</strong>, 'Each employee books a time that suits them'],
        ]}
      />
      <TextSm className="mt-3 text-sm text-gray-500 dark:text-accent-200">
        Nothing happens at the office: no disruption to patients, no space to set aside, and
        employees choose the day and time that works for their life.
      </TextSm>
    </Section>
  )
}
