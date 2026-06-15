import SectionContainer from '@/components/SectionContainer'
import { DEFAULT_PRICING } from 'config'
import Link from '@/components/Link'
import { home } from '@/app/content'
import pages from '@/data/pages.json'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'

const pricingStart = [{ duration: 60 }, { duration: 90 }, { duration: 120 }, { duration: 150 }]

const pricing = pricingStart.map((item) => ({
  ...item,
  price: DEFAULT_PRICING[item.duration],
}))

export default function PricingPage() {
  return (
    <SectionContainer>
      <H1 className="mb-4">{pages.pricing.heading}</H1>
      <TextBase className="mb-6" data-content="pricing.pageLead">
        {home.pricing.pageLead}
      </TextBase>
      <table className="mb-6 w-full table-auto border-collapse overflow-hidden rounded-lg">
        <thead className="bg-primary-500 dark:bg-primary-600 text-accent-100">
          <tr>
            <th className="px-4 py-2 text-left">{pages.pricing.tableHeaders.duration}</th>
            <th className="px-4 py-2 text-left">{pages.pricing.tableHeaders.price}</th>
          </tr>
        </thead>
        <tbody>
          {pricing.map((row) => (
            <tr key={row.duration} className="border-b last:border-b-0">
              <td className="px-4 py-2">{row.duration}</td>
              <td className="px-4 py-2">{`${pages.pricing.currencySymbol}${row.price}`}</td>
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
        {pages.pricing.button}
      </Link>
    </SectionContainer>
  )
}
