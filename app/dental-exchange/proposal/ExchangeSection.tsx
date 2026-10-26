/* ds-ignore-file */
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { TextBase, TextLg, TextSm } from '@/components/ui/text'

import { Section, SectionTitle, Table } from './ProposalParts'

export function ExchangeSection() {
  return (
    <Section className="print:break-before-page print:pt-8">
      <SectionTitle>The Exchange</SectionTitle>
      <Box className="overflow-hidden rounded-lg border-2 border-primary-600">
        <Box className="bg-primary-700 px-6 py-4 text-white dark:text-white">
          <TextLg className="text-lg font-bold text-white dark:text-white">
            Massage Hours for Dental Work — Service for Service
          </TextLg>
        </Box>
        <Box className="p-6">
          <Table
            headers={['', 'Trillium provides', 'Dr. Homyak provides']}
            rows={[
              [
                <strong key="w">What</strong>,
                'In-home massage for your employees',
                'Dental work for me, credited to my current or upcoming bill',
              ],
              [
                <strong key="q">Rate</strong>,
                '$150 per hour of client service',
                'Equal dollar value credited per hour delivered',
              ],
              [
                <strong key="v">Per 90-minute session</strong>,
                '1.5 hours of massage',
                '$225 credit',
              ],
            ]}
          />
          <Stack className="mt-4 items-baseline" direction="row" justify="between">
            <TextLg as="span" className="text-lg font-bold text-primary-700 dark:text-primary-300">
              Balance
            </TextLg>
            <TextBase
              as="span"
              className="text-xl font-bold text-primary-700 dark:text-primary-300"
            >
              Even exchange, hour for hour
            </TextBase>
          </Stack>
        </Box>
      </Box>

      <Box className="mt-6 rounded-lg bg-gray-50 dark:bg-surface-800 p-5 print:bg-white print:border print:border-gray-200">
        <TextBase className="mb-2 font-semibold text-gray-700 dark:text-accent-200">
          Worked example
        </TextBase>
        <TextSm className="text-sm text-gray-600 dark:text-accent-200">
          5 employees each book a 90-minute session → 7.5 hours of massage × $150 ={' '}
          <strong>$1,125 credited</strong> toward my dental work.
        </TextSm>
        <TextSm className="mt-2 text-sm text-gray-600 dark:text-accent-200">
          Your office has estimated I need roughly $4,000 to $10,000 of dental work, so the
          arrangement runs until that balance is covered — about 18 to 44 ninety-minute sessions.
        </TextSm>
      </Box>

      <Box className="mt-6 rounded-lg bg-gray-50 dark:bg-surface-800 p-5 print:bg-white print:border print:border-gray-200">
        <TextBase className="mb-2 font-semibold text-gray-700 dark:text-accent-200">
          Each side provides:
        </TextBase>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-accent-200">
          <li>• Trillium: the table, travel, setup and teardown, and all massage</li>
          <li>• Dr. Homyak: the dental work, and letting employees know the benefit is from you</li>
          <li>• Together: a running tally of hours delivered and credit applied to my bill</li>
        </ul>
      </Box>

      <TextSm className="mt-4 text-sm text-gray-500 dark:text-accent-200">
        I carry full liability insurance and can provide documentation as needed.
      </TextSm>
    </Section>
  )
}
