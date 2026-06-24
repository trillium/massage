/* ds-ignore-file */
import { fetchQRCode } from '@/lib/qr/api'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { H1, H2 } from '@/components/ui/heading'
import { TextSm, TextXs, TextLg, TextBase } from '@/components/ui/text'
import Image from 'next/image'

interface Benefit {
  role: string
  description: string
}

interface EdgePrintAdTemplateProps {
  bookingUrl: string
  heroImage: { src: string; alt: string }
  headline: string
  subtitle: string
  qrLabel: string
  qrUrlDisplay: string
  benefits: Benefit[]
  sessionDetails: string[]
  footerNote: string
}

export default async function EdgePrintAdTemplate({
  bookingUrl,
  heroImage,
  headline,
  subtitle,
  qrLabel,
  qrUrlDisplay,
  benefits,
  sessionDetails,
  footerNote,
}: EdgePrintAdTemplateProps) {
  let qrSvg: string | null = null
  try {
    qrSvg = await fetchQRCode(bookingUrl, 'light')
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
              Edge Esmeralda
            </TextXs>
            <H1 className="text-2xl">Trillium Massage</H1>
          </Box>
          <TextSm>Licensed Massage Therapist</TextSm>
        </Stack>

        {/* Hero image */}
        <Box className="relative mb-5 w-full overflow-hidden rounded-xl">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={1024}
            height={559}
            className="w-full object-cover"
            priority
          />
        </Box>

        {/* Main headline */}
        <Box className="mb-5 text-center">
          <H2 className="text-4xl tracking-tight">{headline}</H2>
          <TextLg status="secondary" className="mt-2">
            {subtitle}
          </TextLg>
        </Box>

        {/* QR + details row */}
        <Stack direction="row" gap={6}>
          {/* QR code */}
          <Stack direction="col" align="center" className="shrink-0">
            <Box className="h-52 w-52 overflow-hidden rounded-xl border-[5px] border-gray-900">
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
              {qrLabel}
            </TextXs>
            <TextXs status="muted" className="mt-0.5 text-center">
              {qrUrlDisplay}
            </TextXs>
          </Stack>

          {/* Details */}
          <Stack direction="col" gap={3} className="flex-1 justify-center">
            <Box className="rounded-xl border-2 border-gray-900 bg-white p-4">
              <TextXs className="mb-2 font-bold uppercase tracking-widest text-red-600">
                Your complimentary benefit
              </TextXs>
              <Stack direction="col" gap={1}>
                {benefits.map((b) => (
                  <Stack key={b.role} direction="row" align="start" gap={2}>
                    <TextXs className="mt-0.5 text-red-600" as="span">
                      ✓
                    </TextXs>
                    <TextSm>
                      <strong>{b.role}</strong> — {b.description}
                    </TextSm>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box className="rounded-xl border-2 border-gray-900 bg-white p-4">
              <TextXs className="mb-2 font-bold uppercase tracking-widest text-red-600">
                Session details
              </TextXs>
              <Stack direction="col" gap={1}>
                {sessionDetails.map((line) => (
                  <TextSm key={line}>{line}</TextSm>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Stack>

        {/* Footer */}
        <Box className="mt-6 border-t border-gray-900 pt-3 text-center">
          <TextBase className="font-semibold">
            Trillium Smith, LMT &nbsp;·&nbsp; trilliummassage.la &nbsp;·&nbsp; 818-738-5344
          </TextBase>
          <TextXs status="muted" className="mt-0.5">
            {footerNote}
          </TextXs>
        </Box>
      </Box>
    </>
  )
}
