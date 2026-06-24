import { fetchQRCode } from '@/lib/qr/api'

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
    subtext: 'Send to phone number in Zelle app',
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
        .print-page {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          background: white;
          color: #111827;
          min-height: 10in;
          display: flex;
          flex-direction: column;
        }
      `}</style>

      <div className="print-page mx-auto w-full max-w-[7.5in] px-2 py-4 print:px-0 print:py-0">
        {/* Header */}
        <div className="mb-6 border-b-2 border-red-600 pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            Trillium Smith, LMT
          </p>
          <h1 className="mt-1 text-4xl font-bold text-gray-900">Thank You!</h1>
          <p className="mt-2 text-lg text-gray-600">
            Your session was complimentary — tips are appreciated and never expected
          </p>
        </div>

        {/* 2×2 QR grid */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          {PAYMENT_METHODS.map((method, i) => {
            const svg = qrSvgs[i]
            return (
              <div
                key={method.name}
                className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5"
              >
                {/* QR code */}
                <div className="mb-3 h-44 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {svg ? (
                    <div
                      className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      QR unavailable
                    </div>
                  )}
                </div>

                {/* Label */}
                <p
                  className="text-xl font-bold uppercase tracking-wide"
                  style={{ color: method.color }}
                >
                  {method.name}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">{method.handle}</p>
                {method.subtext && (
                  <p className="mt-0.5 text-center text-xs text-gray-500">{method.subtext}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-200 pt-3 text-center">
          <p className="text-sm font-semibold text-gray-700">
            Trillium Smith, LMT &nbsp;·&nbsp; trilliummassage.la
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Edge Esmeralda &nbsp;·&nbsp; Thank you for a wonderful session
          </p>
        </div>
      </div>
    </>
  )
}
