/* ds-ignore-file */
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Box } from '@/components/ui/box'
import { H1 } from '@/components/ui/heading'
import { TextBase, TextLg, TextSm } from '@/components/ui/text'

import { ExchangeSection } from '../ExchangeSection'
import { OfferSection } from '../OfferSection'
import { PROPOSAL_TOKEN } from '../proposalToken'
import { Section, SectionTitle } from '../ProposalParts'
import { handoutQrDataUri } from './handoutQr'

export const metadata: Metadata = {
  title: 'Handout — In-Home Staff Wellness Massage Exchange',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ProposalHandoutPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (token !== PROPOSAL_TOKEN) notFound()

  const qrSrc = await handoutQrDataUri()

  return (
    <>
      <style>{`
        @media print {
          header, footer { display: none !important; }
          body { background: white !important; }
          @page { size: letter portrait; margin: 0.5in; }
        }
      `}</style>

      <Box className="mx-auto w-full max-w-[7.5in] bg-white px-2 py-4 font-sans text-gray-900 print:px-0 print:py-0">
        <Box className="mb-6 flex items-start justify-between border-b-4 border-primary-600 pb-4">
          <Box>
            <H1 className="text-2xl font-bold text-gray-900">
              Staff Wellness Massage
              <br />
              <TextBase as="span" className="text-primary-600">
                for Natalia Homyak, DDS
              </TextBase>
            </H1>
            <TextLg className="mt-1 text-gray-500">
              In-home massage for your team, credited against dental work
            </TextLg>
          </Box>
          <Image src="/static/images/logo.svg" alt="Trillium Massage" width={64} height={64} />
        </Box>

        <Section>
          <TextBase className="leading-relaxed">
            I&apos;d love to offer your team in-home massage therapy as a wellness benefit from your
            office, funded as a service-for-service exchange: for every hour of massage I deliver to
            your employees, your office credits me an equal dollar value in dental work. Your
            employees get a massage at home, outside the workplace, and know it came from you.
          </TextBase>
        </Section>

        <OfferSection />

        <Section>
          <SectionTitle>What I Provide</SectionTitle>
          <TextBase className="mb-3 leading-relaxed">
            I come to each employee with a professional massage table and give a full 90-minute
            session tailored to them. I handle setup and teardown, and I provide all massage myself.
          </TextBase>
          <TextBase className="leading-relaxed">
            I&apos;ve been a licensed massage therapist for 14 years with a{' '}
            <strong className="text-primary-700">4.9-star rating</strong> across every platform
            I&apos;ve worked on, and I&apos;ve staffed corporate events for Airbnb, Cedars-Sinai,
            and TJ Maxx.
          </TextBase>
        </Section>

        <ExchangeSection />

        <Box className="mt-6 flex items-center gap-6 rounded-lg border-2 border-primary-600 p-4 print:break-inside-avoid">
          <Image
            src={qrSrc}
            alt="QR code linking to the full proposal"
            width={144}
            height={144}
            unoptimized
          />
          <Box>
            <TextLg className="font-bold text-primary-700">Scan for the full proposal</TextLg>
            <TextSm className="mt-1 text-gray-600">
              Point your phone camera at the code to open the proposal online.
            </TextSm>
            <TextSm className="mt-3 font-semibold text-gray-900">Trillium Smith, LMT</TextSm>
            <TextSm className="text-primary-600">www.trilliummassage.la</TextSm>
          </Box>
        </Box>
      </Box>
    </>
  )
}
