/* ds-ignore-file */
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { H1 } from '@/components/ui/heading'

import { TextBase, TextSm, TextLg } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

import { ExchangeSection } from './ExchangeSection'
import { Section, SectionTitle, Table } from './ProposalParts'

export const metadata: Metadata = {
  title: 'Proposal — In-Home Staff Wellness Massage Exchange',
  robots: { index: false, follow: false },
}

const PROPOSAL_TOKEN = 'dental-exchange-2026'

export default async function ProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (token !== PROPOSAL_TOKEN) notFound()

  return (
    <Box className="mx-auto max-w-3xl px-6 py-12 font-sans text-gray-800 print:max-w-none print:px-0 print:py-0">
      <header className="mb-12 flex items-start justify-between border-b-4 border-primary-600 pb-8">
        <Box>
          <H1 className="text-3xl font-bold text-gray-900 print:text-2xl">
            Staff Wellness Massage
            <br />
            <TextBase as="span" className="text-primary-600">
              for Natalia Homyak, DDS
            </TextBase>
          </H1>
          <TextLg className="mt-2 text-lg text-gray-500">
            In-home massage for your team, credited against dental work
          </TextLg>
        </Box>
        <Image
          src="/static/images/logo.svg"
          alt="Trillium Massage"
          width={80}
          height={80}
          className="print:h-16 print:w-16"
        />
      </header>

      <Box className="mb-10 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-6 text-sm print:border print:border-gray-200 print:bg-white sm:grid-cols-2">
        <Box>
          <TextBase as="span" className="font-semibold text-gray-500">
            Prepared for
          </TextBase>
          <TextBase className="text-gray-900">Dr. Natalia Homyak, DDS & Team</TextBase>
          <TextBase className="text-gray-500">Natalia Homyak, DDS, Inc</TextBase>
          <TextBase className="text-gray-500">
            13160 Mindanao Way, Suite 170, Marina del Rey, CA 90292
          </TextBase>
        </Box>
        <Box>
          <TextBase as="span" className="font-semibold text-gray-500">
            Prepared by
          </TextBase>
          <TextBase className="text-gray-900">Trillium Smith, LMT</TextBase>
          <TextBase className="text-gray-500">October 2026</TextBase>
        </Box>
      </Box>

      <Section>
        <TextBase className="text-base leading-relaxed">
          Hi Dr. Homyak — I&apos;d love to offer your team in-home massage therapy as a wellness
          benefit from your office, and I&apos;d like to propose funding it as a service-for-service
          exchange: for every hour of massage I deliver to your employees, your office credits me an
          equal dollar value in dental work.
        </TextBase>
        <TextBase className="mt-3 text-base leading-relaxed">
          Your employees get a massage at home, outside the workplace, and know it came from you.
        </TextBase>
      </Section>

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
        <TextSm className="mt-3 text-sm text-gray-500">
          Nothing happens at the office: no disruption to patients, no space to set aside, and
          employees choose the day and time that works for their life.
        </TextSm>
      </Section>

      <Section>
        <SectionTitle>What I Provide</SectionTitle>
        <TextBase className="mb-4 leading-relaxed">
          I come to each employee with a professional massage table and give a full 90-minute
          session tailored to them — the neck, shoulders, back, and arms that a day of leaning over
          patients tends to tighten up, or wherever they need it most. I handle setup and teardown.
        </TextBase>
        <TextBase className="mb-4 leading-relaxed">
          I&apos;ve been a licensed massage therapist for 14 years with a{' '}
          <strong className="text-primary-700">4.9-star rating</strong> across every platform
          I&apos;ve worked on. I&apos;ve staffed corporate events for Airbnb, Cedars-Sinai, and TJ
          Maxx. I provide all massage myself.
        </TextBase>
        <Box className="rounded-lg border-l-4 border-primary-600 bg-primary-50 p-5">
          <TextBase className="font-semibold text-primary-800">Why a clinic team</TextBase>
          <TextBase className="mt-2 leading-relaxed text-primary-900">
            Dental work is physically demanding — long stretches of static posture, neck and
            shoulder strain, close precision work. A massage at home is a tangible way to say thank
            you, and it&apos;s recovery time the team can actually relax into.
          </TextBase>
        </Box>
      </Section>

      <Box className="my-8 grid grid-cols-1 gap-3 print:hidden sm:grid-cols-3">
        <Image
          src="/static/images/gallery/table_upper_back_smiling.jpg"
          alt="Table massage upper back"
          width={300}
          height={300}
          className="rounded-lg object-cover"
        />
        <Image
          src="/static/images/gallery/table_neck_massage_client_smiling.jpg"
          alt="Table massage neck"
          width={300}
          height={300}
          className="rounded-lg object-cover"
        />
        <Image
          src="/static/images/gallery/table_shoulder_forearm.jpg"
          alt="Table massage shoulder and forearm"
          width={300}
          height={300}
          className="rounded-lg object-cover"
        />
      </Box>

      <Section>
        <SectionTitle>Why This Works for Your Team</SectionTitle>
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              title: 'A Benefit From Your Office',
              text: 'Employees are told plainly that the practice created this wellness benefit for them.',
            },
            {
              title: 'Zero or Shared Cost',
              text: 'Free to the employee, or shared if you prefer — for example the employee pays about 25%. Tips are welcome either way.',
            },
            {
              title: 'Easy Scheduling',
              text: 'Employees book directly, at home, on their own time. Nothing to arrange at the office.',
            },
            {
              title: 'No Cash Needed',
              text: 'A straight exchange of services: my massage hours for your dental work.',
            },
          ].map((item) => (
            <Box
              key={item.title}
              className="rounded-lg border border-gray-200 p-4 print:border-gray-300"
            >
              <TextBase className="mb-1 font-bold text-primary-700">{item.title}</TextBase>
              <TextSm className="text-sm leading-relaxed text-gray-600">{item.text}</TextSm>
            </Box>
          ))}
        </Box>
      </Section>

      <ExchangeSection />

      <Section>
        <SectionTitle>Next Steps</SectionTitle>
        <TextBase className="leading-relaxed">
          If this sounds good, let me know whether you&apos;d like the benefit free to employees or
          shared, and I&apos;ll send a simple booking link for your team.
        </TextBase>
        <TextBase className="mt-4 leading-relaxed">Thank you for considering it.</TextBase>
      </Section>

      <footer className="mt-12 border-t-2 border-primary-600 pt-6">
        <Stack direction="row" align="center" gap={4}>
          <Image
            src="/static/images/gallery/headshot_branded_hat.jpg"
            alt="Trillium Smith"
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
          <Box>
            <TextLg className="text-lg font-bold text-gray-900">Trillium Smith, LMT</TextLg>
            <TextSm className="text-sm text-gray-500">trilliummassagela@gmail.com</TextSm>
            <TextSm className="text-sm text-primary-600">www.trilliummassage.la</TextSm>
          </Box>
        </Stack>
      </footer>
    </Box>
  )
}
