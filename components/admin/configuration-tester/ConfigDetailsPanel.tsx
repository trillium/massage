import { FaExclamationTriangle } from 'react-icons/fa'
import { SlugConfigurationType } from '@/lib/types'

interface ConfigDetailsPanelProps {
  config: SlugConfigurationType
  slug: string
  onApply: () => void
  onCopyJson: () => void
}

function KeyProperty({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <strong className="text-gray-700 dark:text-gray-300">{label}:</strong>
      {children}
    </div>
  )
}

function LocationWarning({
  warning,
}: {
  warning: NonNullable<SlugConfigurationType['locationWarning']>
}) {
  return (
    <div className="mb-3">
      <strong className="text-gray-700 dark:text-gray-300">Location Warning:</strong>
      <div className="mt-1 rounded border-2 border-amber-200 bg-amber-50 p-2 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-200 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-800 dark:text-amber-200">
            {'city' in warning ? `CITY: ${warning.city}` : `ZIP: ${warning.zip}`}
          </span>
          <span>
            <FaExclamationTriangle className="mr-1 inline text-amber-500" /> {warning.message}
          </span>
        </div>
      </div>
    </div>
  )
}

function CustomFieldBadge({ show, label }: { show?: boolean; label: string }) {
  if (!show) return null
  return (
    <span className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">
      {label}
    </span>
  )
}

export default function ConfigDetailsPanel({
  config,
  slug,
  onApply,
  onCopyJson,
}: ConfigDetailsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-700">
        <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
          Configuration Details for:{' '}
          <code className="rounded bg-gray-200 px-2 py-1 text-sm dark:bg-gray-600">{slug}</code>
        </h3>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <KeyProperty label="Type">
            <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-800 dark:text-blue-200">
              {config.type}
            </span>
          </KeyProperty>

          {config.eventContainer && (
            <KeyProperty label="Event Container">
              <span className="ml-2 rounded bg-green-100 px-2 py-1 text-sm text-green-800 dark:bg-green-800 dark:text-green-200">
                {config.eventContainer}
              </span>
            </KeyProperty>
          )}

          {config.blockingScope && (
            <KeyProperty label="Blocking Scope">
              <span className="ml-2 rounded bg-purple-100 px-2 py-1 text-sm text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                {config.blockingScope}
              </span>
            </KeyProperty>
          )}

          {config.leadTimeMinimum && (
            <KeyProperty label="Lead Time">
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {config.leadTimeMinimum} hours
              </span>
            </KeyProperty>
          )}
        </div>

        {config.title && (
          <div className="mb-3">
            <strong className="text-gray-700 dark:text-gray-300">Title:</strong>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{config.title}</p>
          </div>
        )}

        {config.text && (
          <div className="mb-3">
            <strong className="text-gray-700 dark:text-gray-300">Text:</strong>
            {Array.isArray(config.text) ? (
              config.text.map((paragraph, index) => (
                <p key={index} className="mt-1 text-gray-600 dark:text-gray-400">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="mt-1 text-gray-600 dark:text-gray-400">{config.text}</p>
            )}
          </div>
        )}

        {config.location && (
          <div className="mb-3">
            <strong className="text-gray-700 dark:text-gray-300">Location:</strong>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {config.location.street}, {config.location.city}, {config.location.zip}
              {config.locationIsReadOnly && (
                <span className="ml-2 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                  Read Only
                </span>
              )}
            </p>
          </div>
        )}

        {config.locationWarning && <LocationWarning warning={config.locationWarning} />}

        {config.pricing && Object.keys(config.pricing).length > 0 && (
          <div className="mb-3">
            <strong className="text-gray-700 dark:text-gray-300">Custom Pricing:</strong>
            <div className="mt-1 flex flex-wrap gap-2">
              {Object.entries(config.pricing).map(([duration, price]) => (
                <span
                  key={duration}
                  className="rounded bg-gray-200 px-2 py-1 text-sm dark:bg-gray-600"
                >
                  {duration}min: ${price}
                </span>
              ))}
            </div>
          </div>
        )}

        {config.discount && (
          <div className="mb-3">
            <strong className="text-gray-700 dark:text-gray-300">Discount:</strong>
            <span className="ml-2 rounded bg-red-100 px-2 py-1 text-sm text-red-800 dark:bg-red-800 dark:text-red-200">
              {config.discount.type === 'percent' && config.discount.amountPercent
                ? `${(config.discount.amountPercent * 100).toFixed(0)}% off`
                : config.discount.amountDollars
                  ? `$${config.discount.amountDollars} off`
                  : 'Discount applied'}
            </span>
          </div>
        )}

        {config.promoEndDate && (
          <div className="mb-3">
            <strong className="text-gray-700 dark:text-gray-300">Promo Ends:</strong>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{config.promoEndDate}</span>
          </div>
        )}

        {config.customFields && (
          <div className="mb-3">
            <strong className="text-gray-700 dark:text-gray-300">Custom Fields:</strong>
            <div className="mt-1 flex flex-wrap gap-2">
              <CustomFieldBadge show={config.customFields.showHotelField} label="Hotel Field" />
              <CustomFieldBadge show={config.customFields.showParkingField} label="Parking Field" />
              <CustomFieldBadge show={config.customFields.showNotesField} label="Notes Field" />
            </div>
          </div>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
            View Raw Configuration (JSON)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-gray-800 p-3 text-xs text-green-400">
            {JSON.stringify(config, null, 2)}
          </pre>
        </details>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Apply Configuration
        </button>
        <button
          onClick={onCopyJson}
          className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        >
          Copy JSON
        </button>
      </div>
    </div>
  )
}
