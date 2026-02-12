'use client'

import { MapPinIcon } from '@heroicons/react/24/outline'

interface LocationDisplayProps {
  street?: string
  city: string
  zip?: string
  title?: string
}

export default function LocationDisplay({
  street,
  city,
  zip,
  title = 'Service Location',
}: LocationDisplayProps) {
  return (
    <div className="not-prose my-8 rounded-lg border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <MapPinIcon className="h-6 w-6 flex-shrink-0 text-amber-700" />
        <div>
          <h3 className="font-semibold text-amber-950">{title}</h3>
          <div className="mt-2 space-y-1 text-amber-900">
            {street && <p>{street}</p>}
            <p>
              {city}
              {zip && `, ${zip}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
