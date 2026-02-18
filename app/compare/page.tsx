import SectionContainer from '@/components/SectionContainer'

const Check = () => <span className="text-lg text-emerald-600 dark:text-emerald-400">✓</span>
const Cross = () => <span className="text-lg text-gray-300 dark:text-gray-600">✗</span>
const Star = () => <span className="text-lg text-amber-500">★</span>

type Platform = {
  name: string
  category: string
  price: string
  features: boolean[]
}

const featureLabels = [
  'Online Booking',
  'No Commissions',
  'Mobile-First',
  'AI Scheduling',
  'Transparent Pricing',
  'Client Preferences',
  'Multi-Duration',
  'Same-Day Booking',
  'No Lock-In',
]

const platforms: Platform[] = [
  {
    name: 'Trillium',
    category: 'Purpose-Built',
    price: 'Custom',
    features: [true, true, true, true, true, true, true, true, true],
  },
  {
    name: 'Soothe',
    category: 'Marketplace',
    price: 'Commission',
    features: [true, false, true, false, false, false, false, true, false],
  },
  {
    name: 'Zeel',
    category: 'Marketplace',
    price: 'Commission',
    features: [true, false, true, false, false, false, false, true, false],
  },
  {
    name: 'MassageBook',
    category: 'Massage',
    price: '$20/mo',
    features: [true, true, false, false, false, true, false, false, false],
  },
  {
    name: 'Vagaro',
    category: 'General',
    price: '$30/mo',
    features: [true, true, false, false, false, false, false, false, false],
  },
  {
    name: 'Square',
    category: 'General',
    price: 'Free+fees',
    features: [true, true, true, true, false, false, false, false, false],
  },
  {
    name: 'Acuity',
    category: 'General',
    price: '$20/mo',
    features: [true, true, false, false, false, false, false, false, false],
  },
  {
    name: 'Mindbody',
    category: 'Enterprise',
    price: '$129/mo',
    features: [true, false, true, false, false, false, false, false, false],
  },
  {
    name: 'Boulevard',
    category: 'Enterprise',
    price: '$176/mo',
    features: [true, true, false, false, false, false, false, false, false],
  },
]

const advantages = [
  {
    title: 'No Marketplace Commissions',
    desc: 'Platforms like Soothe take up to 60% of session revenue. You keep what you earn.',
  },
  {
    title: 'AI-Powered Scheduling',
    desc: 'Smart availability that considers lead time, travel, and session duration automatically.',
  },
  {
    title: 'Purpose-Built for Massage',
    desc: 'Not repurposed salon software. Designed for longer sessions, table work, and therapist workflows.',
  },
  {
    title: 'Transparent Pricing',
    desc: 'No hidden fees, no upsell tiers, no surprise processing charges.',
  },
  {
    title: 'Mobile-First Design',
    desc: 'Clients book from their phone. The experience is built for that, not adapted to it.',
  },
  {
    title: 'Multi-Duration Flexibility',
    desc: 'Clients choose 60, 90, 120, or 150-minute sessions with real-time availability for each.',
  },
]

const cellBase = 'px-3 py-2.5 text-sm'
const headerCell = `${cellBase} text-left font-medium text-gray-500 dark:text-gray-400`

export default function Page() {
  return (
    <SectionContainer>
      <div className="py-12">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold tracking-widest text-primary-600 uppercase dark:text-primary-400">
            Platform Comparison
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            How We Compare
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Most booking platforms are built for salons, not massage therapists. We built something
            different.
          </p>
        </div>

        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div
              key={a.title}
              className="rounded-lg border border-gray-200 p-5 dark:border-gray-700"
            >
              <h3 className="mb-1.5 font-semibold text-gray-900 dark:text-gray-100">{a.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{a.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Feature Comparison
        </h2>

        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className={headerCell}>Platform</th>
                <th className={`${headerCell} hidden sm:table-cell`}>Type</th>
                <th className={headerCell}>Price</th>
                {featureLabels.map((f) => (
                  <th key={f} className={`${headerCell} text-center`}>
                    <span className="hidden lg:inline">{f}</span>
                    <span className="lg:hidden" title={f}>
                      {f.split(' ')[0]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platforms.map((p, i) => {
                const isTrillium = i === 0
                const rowClass = isTrillium
                  ? 'bg-primary-50/60 dark:bg-primary-950/30 font-medium'
                  : i % 2 === 1
                    ? 'bg-gray-50/50 dark:bg-gray-800/30'
                    : ''
                return (
                  <tr
                    key={p.name}
                    className={`border-b border-gray-100 dark:border-gray-800 ${rowClass}`}
                  >
                    <td className={`${cellBase} font-medium text-gray-900 dark:text-gray-100`}>
                      {isTrillium && <Star />} {p.name}
                    </td>
                    <td
                      className={`${cellBase} hidden text-gray-500 sm:table-cell dark:text-gray-400`}
                    >
                      {p.category}
                    </td>
                    <td className={`${cellBase} text-gray-600 dark:text-gray-400`}>{p.price}</td>
                    {p.features.map((has, fi) => (
                      <td key={fi} className={`${cellBase} text-center`}>
                        {has ? <Check /> : <Cross />}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-16 rounded-lg bg-gray-50 p-8 dark:bg-gray-800/50">
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
            The Industry Problem
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            <p>
              Marketplace platforms (Soothe, Zeel) take 20–60% commissions and own the client
              relationship. You build their brand, not yours.
            </p>
            <p>
              General booking software (Vagaro, Mindbody) is designed for salons with 15-minute
              haircuts, not 90-minute deep tissue sessions. You pay $30–$176/month for features you
              don&apos;t need.
            </p>
            <p>
              We built a system specifically for massage therapists — with AI scheduling that
              understands lead time, travel, and session duration. No commissions, no bloat, no
              compromise.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
          Data sourced from platform websites and independent reviews, February 2026.
        </p>
      </div>
    </SectionContainer>
  )
}
