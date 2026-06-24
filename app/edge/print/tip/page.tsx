/* ds-ignore-file */
import { fetchQRCode } from '@/lib/qr/api'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { H1 } from '@/components/ui/heading'
import { TextSm, TextXs, TextLg, TextBase } from '@/components/ui/text'

export const dynamic = 'force-dynamic'

const PAYMENT_METHODS = [
  {
    name: 'Venmo',
    handle: '@TrilliumSmith',
    subtext: 'Last 4 digits: 5344',
    url: 'https://venmo.com/u/TrilliumSmith',
    color: '#3D95CE',
  },
  {
    name: 'Cash App',
    handle: '$trilliummassage',
    subtext: null,
    url: 'https://cash.app/$trilliummassage',
    color: '#00C244',
  },
  {
    name: 'PayPal',
    handle: 'trilliummassagela',
    subtext: '@gmail.com',
    url: 'https://paypal.me/trilliummassagela',
    color: '#003087',
  },
  {
    name: 'Zelle',
    handle: '818-738-5344',
    subtext: 'Send to this number in the Zelle app',
    url: '818-738-5344',
    color: '#6D1ED4',
  },
]

export default async function EdgeTipPrintPage() {
  const qrResults = await Promise.allSettled(
    PAYMENT_METHODS.map((m) => fetchQRCode(m.url, 'light'))
  )

  const qrSvgs = qrResults.map((r) => (r.status === 'fulfilled' ? r.value : null))

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
        {/* Header */}
        <Box className="mb-6 border-b-2 border-red-600 pb-4 text-center">
          <TextXs className="font-bold uppercase tracking-widest text-red-600">
            Trillium Smith, LMT
          </TextXs>
          <H1 className="mt-1 text-5xl">Thank You!</H1>
          <TextLg status="secondary" className="mt-2">
            Your session was complimentary — tips are appreciated and never expected
          </TextLg>
        </Box>

        {/* 2×2 QR grid */}
        <Box className="mb-6 grid grid-cols-2 gap-6">
          {PAYMENT_METHODS.map((method, i) => {
            const svg = qrSvgs[i]
            return (
              <Stack
                key={method.name}
                direction="col"
                align="center"
                className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5"
              >
                {/* QR code */}
                <Box className="mb-3 h-44 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {svg ? (
                    <Box
                      className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  ) : (
                    <Stack
                      direction="row"
                      align="center"
                      justify="center"
                      className="h-full w-full"
                    >
                      <TextXs status="muted">QR unavailable</TextXs>
                    </Stack>
                  )}
                </Box>

                {/* Label */}
                <TextBase
                  className="text-xl font-bold uppercase tracking-wide"
                  style={{ color: method.color }}
                >
                  {method.name}
                </TextBase>
                <TextSm className="mt-0.5 font-semibold">{method.handle}</TextSm>
                {method.subtext && (
                  <TextXs status="muted" className="mt-0.5 text-center">
                    {method.subtext}
                  </TextXs>
                )}
              </Stack>
            )
          })}
        </Box>

        {/* Footer */}
        <Box className="mt-auto border-t border-gray-200 pt-3 text-center">
          <TextBase className="font-semibold">
            Trillium Smith, LMT &nbsp;·&nbsp; trilliummassage.la
          </TextBase>
          <TextXs status="muted" className="mt-0.5">
            Edge Esmeralda &nbsp;·&nbsp; Thank you for a wonderful session
          </TextXs>
        </Box>
      </Box>
    </>
  )
}
