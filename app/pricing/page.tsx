import SectionContainer from '@/components/SectionContainer'
import Link from '@/components/Link'
import { home } from '@/app/content'

const pricing = [
  { duration: 30, price: 70 },
  { duration: 60, price: 135 },
  { duration: 90, price: 200 },
]

export default function PricingPage() {
  return (
    <SectionContainer>
      <h1 className="mb-4 text-3xl font-bold">Pricing</h1>
      <p className="mb-6" data-content="pricing.pageLead">
        {home.pricing.pageLead}
      </p>
      <table className="mb-6 w-full table-auto border-collapse overflow-hidden rounded-lg">
        <thead className="bg-primary-500 dark:bg-primary-600 text-accent-100">
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
      <div className="mb-4 text-accent-700 dark:text-accent-300">
        <ul className="list-disc pl-6">
          {home.pricing.notes.map((note, i) => (
            <li key={i} data-content="pricing.note">
              {note}
            </li>
          ))}
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
