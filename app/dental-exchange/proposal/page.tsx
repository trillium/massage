/* ds-ignore-file */
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { H1, H2 } from '@/components/ui/heading'

import { TextBase, TextSm, TextLg } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export const metadata: Metadata = {
  title: 'Proposal — Staff Appreciation Massage Exchange',
  robots: { index: false, follow: false },
}

const PROPOSAL_TOKEN = 'dental-exchange-2026'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`mb-10 ${className}`}>{children}</section>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <H2 className="mb-4 border-b-2 border-primary-600 pb-2 text-2xl font-bold text-primary-700 print:text-xl">
      {children}
    </H2>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={`${i}-${h || 'detail'}`}
              scope="col"
              className="border border-gray-200 bg-primary-50 px-4 py-2 text-left font-semibold text-primary-800"
            >
              {h || (
                <TextBase as="span" className="sr-only">
                  Detail
                </TextBase>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
            {row.map((cell, j) =>
              j === 0 ? (
                <th
                  key={j}
                  scope="row"
                  className="border border-gray-200 px-4 py-2 text-left font-semibold"
                >
                  {cell}
                </th>
              ) : (
                <td key={j} className="border border-gray-200 px-4 py-2">
                  {cell}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

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
            Staff Appreciation Massage
            <br />
            <TextBase as="span" className="text-primary-600">
              for Natalia Homyak, DDS
            </TextBase>
          </H1>
          <TextLg className="mt-2 text-lg text-gray-500">
            A chair massage visit, offered in exchange for dental services
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
          Hi Dr. Homyak — I&apos;d love to bring a staff appreciation massage visit to your office,
          and I&apos;d like to propose doing it as an exchange: my massage for your dental services,
          with no cash changing hands.
        </TextBase>
        <TextBase className="mt-3 text-base leading-relaxed">
          Here&apos;s how I picture it working for a small clinic team.
        </TextBase>
      </Section>

      <Section>
        <SectionTitle>The Visit</SectionTitle>
        <Table
          headers={['', 'Proposed']}
          rows={[
            [<strong key="f">Format</strong>, 'Seated chair massage, fully clothed, no oils'],
            [<strong key="s">Session length</strong>, '15 minutes per person'],
            [<strong key="l">Location</strong>, 'Your office, 13160 Mindanao Way, Suite 170'],
            [<strong key="d">Date and time</strong>, '[DATE AND TIME — TO BE AGREED]'],
            [<strong key="t">Team size</strong>, '[NUMBER OF STAFF — TO BE CONFIRMED]'],
          ]}
        />
        <TextSm className="mt-3 text-sm text-gray-500">
          Short sessions fit around a working day: staff step away one at a time, so the schedule
          keeps running and patients are never left waiting.
        </TextSm>
      </Section>

      <Section>
        <SectionTitle>What I Provide</SectionTitle>
        <TextBase className="mb-4 leading-relaxed">
          I bring the chair, set up in a quiet corner or break room, and give each team member a
          focused 15-minute session on the neck, shoulders, back, and arms — the places a day of
          leaning over patients tends to tighten up. I handle setup and teardown.
        </TextBase>
        <TextBase className="mb-4 leading-relaxed">
          I&apos;ve been a licensed massage therapist for 14 years with a{' '}
          <strong className="text-primary-700">4.9-star rating</strong> across every platform
          I&apos;ve worked on. I&apos;ve staffed corporate events for Airbnb, Cedars-Sinai, and TJ
          Maxx, so I&apos;m comfortable working in a professional setting and around a busy
          schedule. I provide all massage myself.
        </TextBase>
        <Box className="rounded-lg border-l-4 border-primary-600 bg-primary-50 p-5">
          <TextBase className="font-semibold text-primary-800">Why a clinic team</TextBase>
          <TextBase className="mt-2 leading-relaxed text-primary-900">
            Dental work is physically demanding — long stretches of static posture, neck and
            shoulder strain, close precision work. A small team can all be seen in a single visit,
            and it&apos;s a tangible way to say thank you.
          </TextBase>
        </Box>
      </Section>

      <Box className="my-8 grid grid-cols-1 gap-3 print:hidden sm:grid-cols-3">
        <Image
          src="/static/images/gallery/massage_chair_smiling.jpg"
          alt="Chair massage"
          width={300}
          height={300}
          className="rounded-lg object-cover"
        />
        <Image
          src="/static/images/gallery/massage_chair_shoulders_wide.jpg"
          alt="Chair massage shoulders"
          width={300}
          height={300}
          className="rounded-lg object-cover"
        />
        <Image
          src="/static/images/gallery/massage_chair_upper_back.jpg"
          alt="Chair massage upper back"
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
              title: 'Staff Appreciation',
              text: 'A real, in-person thank-you that the whole team gets to enjoy on the same day.',
            },
            {
              title: 'Short Sessions',
              text: 'Fifteen minutes each means everyone is seen without closing the office or disrupting patients.',
            },
            {
              title: 'Easy Scheduling',
              text: 'We pick the quietest window — a lunch break or a slow afternoon — and I work around your appointment book.',
            },
            {
              title: 'No Cash Needed',
              text: 'A straight exchange of services: each side provides what it does best.',
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

      <Section className="print:break-before-page print:pt-8">
        <SectionTitle>The Exchange</SectionTitle>
        <Box className="overflow-hidden rounded-lg border-2 border-primary-600">
          <Box className="bg-primary-600 px-6 py-4 text-white">
            <TextLg className="text-lg font-bold">Massage for Dental Services — No Cash</TextLg>
          </Box>
          <Box className="p-6">
            <Table
              headers={['', 'Trillium provides', 'Dr. Homyak provides']}
              rows={[
                [
                  <strong key="w">What</strong>,
                  'Chair massage visit for your staff',
                  '[DENTAL SERVICES — TO BE FILLED IN]',
                ],
                [
                  <strong key="q">Quantity</strong>,
                  '[NUMBER OF SESSIONS] x 15 minutes',
                  '[QUANTITY OF SERVICES]',
                ],
                [
                  <strong key="v">Value</strong>,
                  '[VALUE — TO BE FILLED IN]',
                  '[VALUE — TO BE FILLED IN]',
                ],
              ]}
            />
            <Stack className="mt-4 items-baseline" direction="row" justify="between">
              <TextLg as="span" className="text-lg font-bold text-primary-700">
                Balance
              </TextLg>
              <TextBase as="span" className="text-xl font-bold text-primary-700">
                [EVEN EXCHANGE — TO BE CONFIRMED]
              </TextBase>
            </Stack>
          </Box>
        </Box>

        <Box className="mt-6 rounded-lg bg-gray-50 p-5 print:bg-white print:border print:border-gray-200">
          <TextBase className="mb-2 font-semibold text-gray-700">Each side provides:</TextBase>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Trillium: the chair, setup and teardown, and all massage</li>
            <li>• Dr. Homyak: a quiet space for the chair and the agreed dental services</li>
            <li>• Together: a date, a time window, and a sign-up order for the team</li>
          </ul>
        </Box>

        <TextSm className="mt-4 text-sm text-gray-500">
          I carry full liability insurance and can provide documentation as needed.
        </TextSm>
      </Section>

      <Section>
        <SectionTitle>Next Steps</SectionTitle>
        <TextBase className="leading-relaxed">
          If this sounds good, let me know which dental services you&apos;d be comfortable
          exchanging and a few windows that work for your team, and we&apos;ll lock in the details.
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
