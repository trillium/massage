import SectionContainer from '@/components/SectionContainer'
import { DEFAULT_PRICING } from 'config'
import Link from '@/components/Link'

const pricingStart = [{ duration: 60 }, { duration: 90 }, { duration: 120 }, { duration: 150 }]

const pricing = pricingStart.map((item) => ({
  ...item,
  price: DEFAULT_PRICING[item.duration],
}))

export default function PricingPage() {
  return (
    <SectionContainer>
      <h1 className="mb-4 text-3xl font-bold">Pricing</h1>
      <p className="mb-6">Transparent pricing for all our massage sessions. No hidden fees.</p>
      <table className="mb-6 w-full table-auto border-collapse overflow-hidden rounded-lg">
        <thead className="bg-primary-500 dark:bg-primary-600 text-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Session Duration (min)</th>
            <th className="px-4 py-2 text-left">Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          {pricing.map((row) => (
            <tr key={row.duration} className="border-b last:border-b-0">
              <td className="px-4 py-2">{row.duration}</td>
              <td className="px-4 py-2">${row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mb-4 text-gray-700 dark:text-gray-300">
        <ul className="list-disc pl-6">
          <li>Westchester/LAX area based.</li>
          <li>
            Additional travel fees may apply for other areas if drive time exceeds 45 minutes.
          </li>
          <li>Payment accepted: cash, Venmo, Zelle.</li>
          <li>A cancellation fee may apply with under 24-hour notice.</li>
        </ul>
      </div>
      <Link
        href="/book"
        className="bg-primary-600 hover:bg-primary-700 rounded px-4 py-2 font-semibold text-white"
      >
        Book a Session
      </Link>
    </SectionContainer>
  )
}
