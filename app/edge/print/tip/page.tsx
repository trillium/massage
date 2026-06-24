/* ds-ignore-file */
import { fetchQRCode } from '@/lib/qr/api'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { H1 } from '@/components/ui/heading'
import { TextSm, TextXs, TextBase } from '@/components/ui/text'

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

      <Box className="mx-auto flex min-h-[10in] w-full max-w-[7.5in] flex-col justify-between bg-white px-2 py-4 text-gray-900 print:px-0 print:py-0">
        {/* Header */}
        <Box className="mb-5 border-b-2 border-red-600 pb-4">
          <TextXs className="mb-1 font-bold uppercase tracking-widest text-red-600">
            Trillium Smith, LMT
          </TextXs>
          <H1 className="text-6xl font-bold leading-tight">Thank You!</H1>
          <H1 className="text-6xl font-bold leading-tight">Tips Appreciated</H1>
        </Box>

        {/* 3-row stack */}
        <Stack direction="col" className="flex-1 justify-between py-4">
          {PAYMENT_METHODS.map((method, i) => {
            const svg = qrSvgs[i]
            return (
              <Stack
                key={method.name}
                direction="row"
                align="center"
                gap={6}
                className="rounded-xl border-2 border-gray-900 bg-white px-5 py-4"
              >
                {/* QR */}
                <Box className="h-36 w-36 shrink-0 overflow-hidden rounded-lg border-[5px] border-gray-900 bg-white">
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

                {/* Info */}
                <Stack direction="col" gap={1}>
                  <TextBase
                    className="text-3xl font-bold uppercase tracking-wide"
                    style={{ color: method.color }}
                  >
                    {method.name}
                  </TextBase>
                  <TextBase className="text-xl font-semibold text-gray-800">
                    {method.handle}
                    {method.subtext && (
                      <TextSm as="span" status="muted" className="ml-2">
                        {method.subtext}
                      </TextSm>
                    )}
                  </TextBase>
                </Stack>
              </Stack>
            )
          })}
        </Stack>

        {/* Footer */}
        <Box className="mt-6 border-t border-gray-200 pt-3 text-center">
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
