'use client'

import { DEFAULT_PRICING } from 'config'

interface PricingComparisonProps {
  title?: string
  durations?: number[]
  description?: string
}

export default function PricingComparison({
  title = 'Pricing',
  durations = [60, 90, 120, 150],
  description,
}: PricingComparisonProps) {
  return (
    <div className="not-prose my-8">
      {title && <h3 className="mb-4 text-2xl font-bold">{title}</h3>}
      {description && <p className="mb-6 text-gray-600">{description}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-teal-50 to-blue-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900">Duration</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-900">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {durations.map((duration) => {
              const price = DEFAULT_PRICING[duration as keyof typeof DEFAULT_PRICING]
              return (
                <tr key={duration} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">
                    {duration} minutes {duration >= 60 && `(${(duration / 60).toFixed(1)} hour${duration > 60 ? 's' : ''})`}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    ${price.toFixed(0)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
