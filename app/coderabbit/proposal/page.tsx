import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Proposal — CodeRabbit Miami 2026',
  robots: { index: false, follow: false },
}

const PROPOSAL_TOKEN = 'cr-miami-2026'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`mb-10 ${className}`}>{children}</section>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b-2 border-teal-600 pb-2 text-2xl font-bold text-teal-700 print:text-xl">
      {children}
    </h2>
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
              className="border border-accent-200 bg-teal-50 px-4 py-2 text-left font-semibold text-teal-800"
            >
              {h || <span className="sr-only">Detail</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? 'bg-surface-100' : ''}>
            {row.map((cell, j) =>
              j === 0 ? (
                <th
                  key={j}
                  scope="row"
                  className="border border-accent-200 px-4 py-2 text-left font-semibold"
                >
                  {cell}
                </th>
              ) : (
                <td key={j} className="border border-accent-200 px-4 py-2">
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
    <div className="mx-auto max-w-3xl px-6 py-12 font-sans text-accent-800 print:max-w-none print:px-0 print:py-0">
      {/* Header */}
      <header className="mb-12 flex items-start justify-between border-b-4 border-teal-600 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-accent-900 print:text-2xl">
            Chair Massage Services
            <br />
            <span className="text-teal-600">for CodeRabbit</span>
          </h1>
          <p className="mt-2 text-lg text-accent-500">
            AI Engineer Miami & React Miami — April 2026
          </p>
        </div>
        <Image
          src="/static/images/logo.svg"
          alt="Trillium Massage"
          width={80}
          height={80}
          className="print:h-16 print:w-16"
        />
      </header>

      {/* Meta */}
      <div className="mb-10 grid grid-cols-1 gap-4 rounded-lg bg-surface-100 p-6 text-sm print:border print:border-accent-200 print:bg-surface-50 sm:grid-cols-2">
        <div>
          <span className="font-semibold text-accent-500">Prepared for</span>
          <p className="text-accent-900">Theresa Ensminger & Team</p>
          <p className="text-accent-500">CodeRabbit</p>
        </div>
        <div>
          <span className="font-semibold text-accent-500">Prepared by</span>
          <p className="text-accent-900">Trillium Smith, LMT</p>
          <p className="text-accent-500">March 2026</p>
        </div>
      </div>

      {/* Intro */}
      <Section>
        <p className="text-base leading-relaxed">
          Hi Theresa — it was great meeting you and the team at SCaLE 23x. I&apos;m excited about
          the opportunity to work together again in Miami. You&apos;ve experienced my work firsthand
          at the convention center, so you already know what I bring to the table.
        </p>
        <p className="mt-3 text-base leading-relaxed">
          I&apos;d love to provide chair massage services at both AI Engineer Miami and React Miami
          this April. Here&apos;s what I&apos;m proposing.
        </p>
      </Section>

      {/* Events */}
      <Section>
        <SectionTitle>The Events</SectionTitle>
        <Table
          headers={['', 'AI Engineer Miami', 'React Miami']}
          rows={[
            [<strong key="d">Dates</strong>, 'April 20–21', 'April 23–24'],
            [<strong key="v">Venue</strong>, 'Hyatt Regency Miami', 'Hyatt Regency Miami'],
            [<strong key="a">Attendance</strong>, '500+', '~500'],
          ]}
        />
        <p className="mt-3 text-sm text-accent-500">
          Both conferences at the same venue, back-to-back. One trip, seamless coverage across the
          full week.
        </p>
      </Section>

      {/* What I Provide */}
      <Section>
        <SectionTitle>What I Provide</SectionTitle>
        <p className="mb-4 leading-relaxed">
          Professional chair massage at or near the CodeRabbit booth throughout each conference day
          — approximately six hours of service per day, scheduled flexibly around the rhythm of the
          event. Busy during breaks and between sessions, lighter during keynotes.
        </p>
        <p className="mb-4 leading-relaxed">
          I&apos;ve been a licensed massage therapist for 11 years with a{' '}
          <strong className="text-teal-700">4.9-star rating</strong> across every platform I&apos;ve
          worked on. I&apos;ve staffed corporate events for Airbnb, Cedars-Sinai, and TJ Maxx, and
          I&apos;m very comfortable working long hours in conference and corporate environments. I
          know the pace, I know how to read a room, and I know how to keep a line moving without
          rushing anyone.
        </p>
        <div className="rounded-lg border-l-4 border-teal-600 bg-teal-50 p-5">
          <p className="font-semibold text-teal-800">What makes this different</p>
          <p className="mt-2 leading-relaxed text-teal-900">
            I&apos;m also a software developer. I understand the audience at these conferences
            because I&apos;m part of it. I can talk to attendees about what CodeRabbit does — not
            from a script, but from real experience. By April, I&apos;ll be a CodeRabbit power user
            and a genuine advocate for the product.
          </p>
          <p className="mt-2 leading-relaxed text-teal-900">
            Your booth doesn&apos;t just offer a massage — it offers a conversation with someone who
            speaks the audience&apos;s language and knows your product.
          </p>
        </div>
      </Section>

      {/* Photo Break */}
      <div className="my-8 grid grid-cols-1 gap-3 print:hidden sm:grid-cols-3">
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
      </div>

      {/* Value Prop */}
      <Section>
        <SectionTitle>Why This Works for CodeRabbit</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              title: 'Booth Traffic',
              text: '"Free massage at the CodeRabbit booth" spreads through a conference in the first hour. At SCaLE, demand grew every day as word got around.',
            },
            {
              title: 'Dwell Time',
              text: 'People waiting for a session linger at the booth. Your team gets natural, low-pressure time to connect with attendees and have real conversations.',
            },
            {
              title: 'Memorability',
              text: "Attendees remember the booth that took care of them. It's the one they tell people about, post about, and come back to.",
            },
            {
              title: 'Developer Wellness',
              text: 'Conferences are long days. Offering massage signals that CodeRabbit genuinely cares about the people who use its product.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-accent-200 p-4 print:border-accent-300"
            >
              <p className="mb-1 font-bold text-teal-700">{item.title}</p>
              <p className="text-sm leading-relaxed text-accent-600">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SCaLE Proof */}
      <Section>
        <SectionTitle>Proof of Concept: SCaLE 23x</SectionTitle>
        <p className="mb-4 leading-relaxed">
          At SCaLE 23x in March 2026, I delivered{' '}
          <strong className="text-teal-700">50 massage sessions</strong> over 3 days — 12 hours of
          total massage time.
        </p>
        <Table
          headers={['Day', 'Sessions', 'Notes']}
          rows={[
            ['Day 1', '17', 'Word starting to spread'],
            ['Day 2', '26', 'Peak demand, steady flow all day'],
            ['Day 3', '7', 'Shortened schedule'],
            [<strong key="t">Total</strong>, <strong key="tv">50</strong>, ''],
          ]}
        />
        <p className="mt-3 text-sm leading-relaxed text-accent-500">
          Three attendees came back for repeat sessions. The demand was real and it grew organically
          each day.
        </p>
      </Section>

      {/* Investment — page break before this section for print */}
      <Section className="print:break-before-page print:pt-8">
        <SectionTitle>Investment</SectionTitle>
        <div className="overflow-hidden rounded-lg border-2 border-teal-600">
          <div className="bg-teal-600 px-6 py-4 text-white">
            <p className="text-lg font-bold">Both Conferences — 4 Days</p>
          </div>
          <div className="p-6">
            <div className="mb-4 flex items-baseline justify-between border-b border-accent-200 pb-4">
              <span className="text-accent-600">Daily rate</span>
              <span className="text-xl font-bold text-accent-900">$1,000/day</span>
            </div>
            <div className="mb-4 flex items-baseline justify-between border-b border-accent-200 pb-4">
              <span className="text-accent-600">Conference days</span>
              <span className="text-accent-900">4 (April 20–21 + April 23–24)</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-teal-700">Total</span>
              <span className="text-2xl font-bold text-teal-700">$4,000</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-accent-600">
          This covers approximately six hours of chair massage service per day, all equipment,
          setup, and teardown.
        </p>

        <div className="mt-6 rounded-lg bg-surface-100 p-5 print:bg-surface-50 print:border print:border-accent-200">
          <p className="mb-2 font-semibold text-accent-700">CodeRabbit arranges:</p>
          <ul className="space-y-1 text-sm text-accent-600">
            <li>• Round-trip flight (Los Angeles to Miami)</li>
            <li>• Hotel accommodations (April 19–24)</li>
            <li>• Equipment logistics (getting the massage chair to the venue)</li>
          </ul>
        </div>

        <p className="mt-4 text-sm text-accent-500">
          I carry full liability insurance and can provide documentation as needed.
        </p>
      </Section>

      {/* Next Steps */}
      <Section>
        <SectionTitle>Next Steps</SectionTitle>
        <p className="leading-relaxed">
          I&apos;d love to hop on a quick call <strong>the week of March 17</strong> to talk through
          any questions and get the details locked in. Let me know what works for you.
        </p>
        <p className="mt-4 leading-relaxed">Looking forward to it.</p>
      </Section>

      {/* Footer */}
      <footer className="mt-12 border-t-2 border-teal-600 pt-6">
        <div className="flex items-center gap-4">
          <Image
            src="/static/images/gallery/headshot_branded_hat.jpg"
            alt="Trillium Smith"
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-bold text-accent-900">Trillium Smith, LMT</p>
            <p className="text-sm text-accent-500">trilliummassagela@gmail.com</p>
            <p className="text-sm text-teal-600">www.trilliummassage.la</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
