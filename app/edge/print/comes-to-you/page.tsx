/* ds-ignore-file */
import { fetchQRCode } from '@/lib/qr/api'
import { EDGE_MIN } from '@/lib/slugConfigurations/slugs/edge'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { H1, H2 } from '@/components/ui/heading'
import { TextSm, TextXs, TextLg, TextBase } from '@/components/ui/text'
import Image from 'next/image'

const BOOKING_URL = 'https://trilliummassage.la/edge-comes-to-you'

export const dynamic = 'force-dynamic'

export default async function EdgeComesToYouPrintPage() {
  let qrSvg: string | null = null
  try {
    qrSvg = await fetchQRCode(BOOKING_URL, 'light')
  } catch {
    qrSvg = null
  }

  return (
    <>
      <style>{`
        @media print {
          header, footer { display: none !important; }
          body { background: white !important; }
          @page { size: letter portrait; margin: 0.4in; }
        }
      `}</style>

      <Box className="mx-auto w-full max-w-[7.5in] bg-white px-2 py-4 text-gray-900 print:px-0 print:py-0">
        {/* Header bar */}
        <Stack
          direction="row"
          align="center"
          justify="between"
          className="mb-4 border-b-2 border-red-600 pb-3"
        >
          <Box>
            <TextXs className="font-bold uppercase tracking-widest text-red-600">
              Edge Esmeralda — Exclusive
            </TextXs>
            <H1 className="text-2xl">Trillium Massage</H1>
          </Box>
          <TextSm status="muted">Licensed Massage Therapist · Los Angeles, CA</TextSm>
        </Stack>

        {/* Hero image */}
        <Box className="relative mb-5 w-full overflow-hidden rounded-xl">
          <Image
            src="/static/images/edge/edge-comes-to-you.png"
            alt="Massage table on a winding road — Shoulder Work Ahead"
            width={1024}
            height={559}
            className="w-full object-cover"
            priority
          />
        </Box>

        {/* Main headline */}
        <Box className="mb-5 text-center">
          <H2 className="text-4xl tracking-tight">Table Massage — Comes to You</H2>
          <TextLg status="secondary" className="mt-2">
            At your hotel, Airbnb, or any location of your choosing
          </TextLg>
        </Box>

        {/* QR + details row */}
        <Stack direction="row" gap={6}>
          {/* QR code */}
          <Stack direction="col" align="center" className="shrink-0">
            <Box className="h-52 w-52 overflow-hidden rounded-xl border-2 border-gray-200">
              {qrSvg ? (
                <Box
                  className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <Stack direction="row" align="center" justify="center" className="h-full w-full">
                  <TextXs status="muted">QR unavailable</TextXs>
                </Stack>
              )}
            </Box>
            <TextXs
              className="mt-2 text-center font-semibold uppercase tracking-wide"
              status="muted"
            >
              Scan to book
            </TextXs>
            <TextXs status="muted" className="mt-0.5 text-center">
              trilliummassage.la/edge-comes-to-you
            </TextXs>
          </Stack>

          {/* Details */}
          <Stack direction="col" gap={3} className="flex-1 justify-center">
            <Box className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <TextXs className="mb-2 font-bold uppercase tracking-widest text-red-600">
                Your complimentary benefit
              </TextXs>
              <Stack direction="col" gap={1}>
                <Stack direction="row" align="start" gap={2}>
                  <TextXs className="mt-0.5 text-red-600" as="span">
                    ✓
                  </TextXs>
                  <TextSm>
                    <strong>Attendees</strong> — +{EDGE_MIN.comesToYou.attendee} minute bonus on any
                    session
                  </TextSm>
                </Stack>
                <Stack direction="row" align="start" gap={2}>
                  <TextXs className="mt-0.5 text-red-600" as="span">
                    ✓
                  </TextXs>
                  <TextSm>
                    <strong>Volunteers</strong> — +{EDGE_MIN.comesToYou.volunteer} minute bonus on
                    any session
                  </TextSm>
                </Stack>
                <Stack direction="row" align="start" gap={2}>
                  <TextXs className="mt-0.5 text-red-600" as="span">
                    ✓
                  </TextXs>
                  <TextSm>
                    <strong>Team</strong> — Fully complimentary, no tip necessary
                  </TextSm>
                </Stack>
              </Stack>
            </Box>

            <Box className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <TextXs className="mb-2 font-bold uppercase tracking-widest" status="muted">
                Session details
              </TextXs>
              <Stack direction="col" gap={1}>
                <TextSm>60 / 90 / 120 minute sessions available</TextSm>
                <TextSm>Book at least 2 hours in advance</TextSm>
                <TextSm>Table brought to your location — no travel needed</TextSm>
                <TextSm>Instant confirmation via email</TextSm>
              </Stack>
            </Box>
          </Stack>
        </Stack>

        {/* Footer */}
        <Box className="mt-6 border-t border-gray-200 pt-3 text-center">
          <TextBase className="font-semibold">
            Trillium Smith, LMT &nbsp;·&nbsp; trilliummassage.la &nbsp;·&nbsp; 818-738-5344
          </TextBase>
          <TextXs status="muted" className="mt-0.5">
            Also offering drop-in office hours chair massage — scan the QR at the massage station
          </TextXs>
        </Box>
      </Box>
    </>
  )
}
