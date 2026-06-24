import { fetchQRCode } from '@/lib/qr/api'
import { EDGE_MIN } from '@/lib/slugConfigurations/slugs/edge'
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
        {/* Header bar */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-red-600 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">
              Edge Esmeralda — Exclusive
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Trillium Massage</h1>
          </div>
          <p className="text-sm text-gray-500">Licensed Massage Therapist · Los Angeles, CA</p>
        </div>

        {/* Hero image */}
        <div className="relative mb-5 w-full overflow-hidden rounded-xl">
          <Image
            src="/static/images/edge/edge-comes-to-you.png"
            alt="Massage table on a winding road — Shoulder Work Ahead"
            width={1024}
            height={559}
            className="w-full object-cover"
            priority
          />
        </div>

        {/* Main headline */}
        <div className="mb-5 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">
            Table Massage — Comes to You
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            At your hotel, Airbnb, or any location of your choosing
          </p>
        </div>

        {/* QR + details row */}
        <div className="flex gap-6">
          {/* QR code */}
          <div className="flex shrink-0 flex-col items-center">
            <div className="h-52 w-52 overflow-hidden rounded-xl border-2 border-gray-200">
              {qrSvg ? (
                <div
                  className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  QR unavailable
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
              Scan to book
            </p>
            <p className="mt-0.5 text-center text-xs text-gray-400">trilliummassage.la/edge-comes-to-you</p>
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col justify-center gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-600">
                Your complimentary benefit
              </p>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-red-600">✓</span>
                  <span>
                    <strong>Attendees</strong> — +{EDGE_MIN.comesToYou.attendee} minute bonus on any
                    session
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-red-600">✓</span>
                  <span>
                    <strong>Volunteers</strong> — +{EDGE_MIN.comesToYou.volunteer} minute bonus on
                    any session
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-red-600">✓</span>
                  <span>
                    <strong>Team</strong> — Fully complimentary, no tip necessary
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                Session details
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>60 / 90 / 120 minute sessions available</li>
                <li>Book at least 2 hours in advance</li>
                <li>Table brought to your location — no travel needed</li>
                <li>Instant confirmation via email</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-200 pt-3 text-center">
          <p className="text-sm font-semibold text-gray-700">
            Trillium Smith, LMT &nbsp;·&nbsp; trilliummassage.la &nbsp;·&nbsp; 818-738-5344
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Also offering drop-in office hours chair massage — scan the QR at the massage station
          </p>
        </div>
      </div>
    </>
  )
}
