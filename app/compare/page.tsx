import SectionContainer from '@/components/SectionContainer'
import { FaCheck, FaTimes, FaStar } from 'react-icons/fa'

const Check = () => <FaCheck className="text-lg text-emerald-600 dark:text-emerald-400" />
const Cross = () => <FaTimes className="text-lg text-gray-300 dark:text-gray-600" />
const Soon = () => (
  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Soon</span>
)
const Star = () => <FaStar className="text-lg text-amber-500" />

type CellValue = 'yes' | 'no' | 'soon'
type Platform = { name: string; category: string; price: string; features: CellValue[] }

const featureLabels = [
  'Online Booking',
  'No Commissions',
  'Mobile-First',
  'AI Scheduling',
  'Multi-Duration',
  'Payments',
  'Auto Reminders',
  'Intake Forms',
  'Gift Cards',
  'Self-Service Cancel',
  'Client Discovery',
  'Email Marketing',
]

const platforms: Platform[] = [
  {
    name: 'Trillium',
    category: 'Purpose-Built',
    price: 'Custom',
    features: [
      'yes',
      'yes',
      'yes',
      'yes',
      'yes',
      'soon',
      'soon',
      'soon',
      'soon',
      'soon',
      'no',
      'soon',
    ],
  },
  {
    name: 'Soothe',
    category: 'Marketplace',
    price: '~60% cut',
    features: ['yes', 'no', 'yes', 'no', 'no', 'yes', 'yes', 'no', 'no', 'no', 'yes', 'no'],
  },
  {
    name: 'Zeel',
    category: 'Marketplace',
    price: '~60% cut',
    features: ['yes', 'no', 'yes', 'no', 'no', 'yes', 'yes', 'no', 'no', 'no', 'yes', 'no'],
  },
  {
    name: 'MassageBook',
    category: 'Massage',
    price: '$20/mo',
    features: ['yes', 'yes', 'no', 'no', 'no', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
  },
  {
    name: 'Vagaro',
    category: 'General',
    price: '$30/mo',
    features: ['yes', 'yes', 'no', 'yes', 'no', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
  },
  {
    name: 'Square',
    category: 'General',
    price: 'Free+fees',
    features: ['yes', 'yes', 'yes', 'yes', 'no', 'yes', 'yes', 'no', 'no', 'yes', 'no', 'no'],
  },
  {
    name: 'Acuity',
    category: 'General',
    price: '$20/mo',
    features: ['yes', 'yes', 'no', 'no', 'no', 'yes', 'yes', 'yes', 'no', 'yes', 'no', 'no'],
  },
  {
    name: 'Mindbody',
    category: 'Enterprise',
    price: '$129/mo',
    features: ['yes', 'no', 'yes', 'no', 'no', 'yes', 'yes', 'no', 'yes', 'yes', 'yes', 'yes'],
  },
  {
    name: 'Boulevard',
    category: 'Enterprise',
    price: '$176/mo',
    features: ['yes', 'yes', 'no', 'yes', 'no', 'yes', 'yes', 'no', 'yes', 'yes', 'no', 'yes'],
  },
]

const advantages = [
  { title: 'No Commissions', desc: 'Soothe and Zeel take up to 60% of session revenue.' },
  { title: 'AI Scheduling', desc: 'Lead time, travel gaps, and duration-aware slot generation.' },
  { title: 'Purpose-Built', desc: 'Designed for 90-minute sessions, not 15-minute haircuts.' },
  { title: 'Transparent Pricing', desc: 'No hidden fees, no upsell tiers.' },
  { title: 'Mobile-First', desc: 'Built for phones, not adapted from desktop.' },
  { title: 'Multi-Duration', desc: '60–150 min sessions with real-time availability for each.' },
]

const roadmap = [
  { feature: 'Online Payments', desc: 'Pay at booking — no more Venmo after the session' },
  { feature: 'Auto Reminders', desc: 'SMS and email confirmations so clients never forget' },
  { feature: 'Intake Forms', desc: 'Health history, conditions, and preferences before arrival' },
  { feature: 'Gift Cards', desc: 'Buy a massage for someone — biggest holiday revenue driver' },
  { feature: 'Self-Service Changes', desc: 'Clients cancel or reschedule without texting you' },
  { feature: 'Email Marketing', desc: 'Re-engage past clients with automated campaigns' },
]

const cellBase = 'px-2 py-2 text-sm'
const headerCell = `${cellBase} text-left font-medium text-gray-500 dark:text-gray-400`
const CellIcon = ({ v }: { v: CellValue }) =>
  v === 'yes' ? <Check /> : v === 'soon' ? <Soon /> : <Cross />

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
            An honest look at where we lead, where we&apos;re catching up, and why it matters.
          </p>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Where We Lead</h2>
        <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div
              key={a.title}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">{a.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{a.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Where We&apos;re Catching Up
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          We&apos;re a powerful scheduling engine — but scheduling is only one piece. Here&apos;s
          what&apos;s on our roadmap.
        </p>
        <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((r) => (
            <div
              key={r.feature}
              className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20"
            >
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                <Soon /> <span className="ml-1">{r.feature}</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{r.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Full Feature Grid
        </h2>
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className={headerCell}>Platform</th>
                <th className={headerCell}>Price</th>
                {featureLabels.map((f) => (
                  <th key={f} className={`${headerCell} text-center`} title={f}>
                    <span className="hidden xl:inline">{f}</span>
                    <span className="xl:hidden">{f.split(' ')[0]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platforms.map((p, i) => {
                const isUs = i === 0
                const rowClass = isUs
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
                      {isUs && <Star />} {p.name}
                    </td>
                    <td className={`${cellBase} text-gray-600 dark:text-gray-400`}>{p.price}</td>
                    {p.features.map((v, fi) => (
                      <td key={fi} className={`${cellBase} text-center`}>
                        <CellIcon v={v} />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-14 rounded-lg bg-gray-50 p-8 dark:bg-gray-800/50">
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
            The Honest Take
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            <p>
              Right now, we&apos;re a best-in-class scheduling engine with real AI — not a full
              business suite. Vagaro at $30/mo gives you payments, reminders, intake forms, gift
              cards, and marketing. We don&apos;t do that yet.
            </p>
            <p>
              What we do is build software specifically for massage therapists, not repurpose salon
              tools. Our scheduling understands lead time, travel, multi-duration sessions, and
              timezone-aware availability in ways no competitor matches.
            </p>
            <p>
              The features above marked <Soon /> are actively in development. We&apos;d rather ship
              each one right than ship everything half-baked.
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
