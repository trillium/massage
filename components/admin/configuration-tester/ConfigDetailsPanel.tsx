import { FaExclamationTriangle } from 'react-icons/fa'
import { SlugConfigurationType } from '@/lib/types'

import { Button } from '@/components/ui/button'
import { H3 } from '@/components/ui/heading'
import { Code } from '@/components/ui/code'

import { TextBase, TextSm, TextXs } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface ConfigDetailsPanelProps {
  config: SlugConfigurationType
  slug: string
  onApply: () => void
  onCopyJson: () => void
}

function KeyProperty({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <strong className="text-accent-700 dark:text-accent-300">{label}:</strong>
      {children}
    </Box>
  )
}

function LocationWarning({
  warning,
}: {
  warning: NonNullable<SlugConfigurationType['locationWarning']>
}) {
  return (
    <Box className="mb-3">
      <strong className="text-accent-700 dark:text-accent-300">Location Warning:</strong>
      <Box className="mt-1 rounded border-2 border-amber-200 bg-amber-50 p-2 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
        <Stack direction="row" align="center" gap={2}>
          <TextXs
            as="span"
            className="rounded bg-amber-200 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-800 dark:text-amber-200"
          >
            {'city' in warning ? `CITY: ${warning.city}` : `ZIP: ${warning.zip}`}
          </TextXs>
          <TextBase as="span">
            <FaExclamationTriangle className="mr-1 inline text-amber-500" /> {warning.message}
          </TextBase>
        </Stack>
      </Box>
    </Box>
  )
}

function CustomFieldBadge({ show, label }: { show?: boolean; label: string }) {
  if (!show) return null
  return (
    <TextSm
      as="span"
      className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200"
    >
      {label}
    </TextSm>
  )
}

export default function ConfigDetailsPanel({
  config,
  slug,
  onApply,
  onCopyJson,
}: ConfigDetailsPanelProps) {
  return (
    <Box className="space-y-4">
      <Box className="rounded-md bg-surface-100 p-4 dark:bg-surface-700">
        <H3 className="mb-3 text-lg font-medium text-accent-900 dark:text-accent-100">
          Configuration Details for:{' '}
          <Code className="rounded bg-surface-200 px-2 py-1 text-sm dark:bg-surface-600">
            {slug}
          </Code>
        </H3>

        <Box className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <KeyProperty label="Type">
            <TextSm
              as="span"
              className="ml-2 rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-800 dark:text-blue-200"
            >
              {config.type}
            </TextSm>
          </KeyProperty>

          {config.eventContainer && (
            <KeyProperty label="Event Container">
              <TextSm
                as="span"
                className="ml-2 rounded bg-green-100 px-2 py-1 text-sm text-green-800 dark:bg-green-800 dark:text-green-200"
              >
                {config.eventContainer}
              </TextSm>
            </KeyProperty>
          )}

          {config.blockingScope && (
            <KeyProperty label="Blocking Scope">
              <TextSm
                as="span"
                className="ml-2 rounded bg-purple-100 px-2 py-1 text-sm text-purple-800 dark:bg-purple-800 dark:text-purple-200"
              >
                {config.blockingScope}
              </TextSm>
            </KeyProperty>
          )}

          {config.leadTimeMinimum && (
            <KeyProperty label="Lead Time">
              <TextBase as="span" className="ml-2 text-accent-600 dark:text-accent-400">
                {config.leadTimeMinimum} hours
              </TextBase>
            </KeyProperty>
          )}
        </Box>

        {config.title && (
          <Box className="mb-3">
            <strong className="text-accent-700 dark:text-accent-300">Title:</strong>
            <TextBase className="mt-1 text-accent-600 dark:text-accent-400">
              {config.title}
            </TextBase>
          </Box>
        )}

        {config.text && (
          <Box className="mb-3">
            <strong className="text-accent-700 dark:text-accent-300">Text:</strong>
            {Array.isArray(config.text) ? (
              config.text.map((paragraph, index) => (
                <TextBase key={index} className="mt-1 text-accent-600 dark:text-accent-400">
                  {paragraph}
                </TextBase>
              ))
            ) : (
              <TextBase className="mt-1 text-accent-600 dark:text-accent-400">
                {config.text}
              </TextBase>
            )}
          </Box>
        )}

        {config.location && (
          <Box className="mb-3">
            <strong className="text-accent-700 dark:text-accent-300">Location:</strong>
            <TextBase className="mt-1 text-accent-600 dark:text-accent-400">
              {config.location.street}, {config.location.city}, {config.location.zip}
              {config.locationIsReadOnly && (
                <TextXs
                  as="span"
                  className="ml-2 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                >
                  Read Only
                </TextXs>
              )}
            </TextBase>
          </Box>
        )}

        {config.locationWarning && <LocationWarning warning={config.locationWarning} />}

        {config.pricing && Object.keys(config.pricing).length > 0 && (
          <Box className="mb-3">
            <strong className="text-accent-700 dark:text-accent-300">Custom Pricing:</strong>
            <Stack className="mt-1" direction="row" wrap gap={2}>
              {Object.entries(config.pricing).map(([duration, price]) => (
                <TextSm
                  as="span"
                  key={duration}
                  className="rounded bg-surface-200 px-2 py-1 text-sm dark:bg-surface-600"
                >
                  {duration}min: ${price}
                </TextSm>
              ))}
            </Stack>
          </Box>
        )}

        {config.discount && (
          <Box className="mb-3">
            <strong className="text-accent-700 dark:text-accent-300">Discount:</strong>
            <TextSm
              as="span"
              className="ml-2 rounded bg-red-100 px-2 py-1 text-sm text-red-800 dark:bg-red-800 dark:text-red-200"
            >
              {config.discount.type === 'percent' && config.discount.amountPercent
                ? `${(config.discount.amountPercent * 100).toFixed(0)}% off`
                : config.discount.amountDollars
                  ? `$${config.discount.amountDollars} off`
                  : 'Discount applied'}
            </TextSm>
          </Box>
        )}

        {config.promoEndDate && (
          <Box className="mb-3">
            <strong className="text-accent-700 dark:text-accent-300">Promo Ends:</strong>
            <TextBase as="span" className="ml-2 text-accent-600 dark:text-accent-400">
              {config.promoEndDate}
            </TextBase>
          </Box>
        )}

        {config.customFields && (
          <Box className="mb-3">
            <strong className="text-accent-700 dark:text-accent-300">Custom Fields:</strong>
            <Stack className="mt-1" direction="row" wrap gap={2}>
              <CustomFieldBadge show={config.customFields.showHotelField} label="Hotel Field" />
              <CustomFieldBadge show={config.customFields.showParkingField} label="Parking Field" />
              <CustomFieldBadge show={config.customFields.showNotesField} label="Notes Field" />
            </Stack>
          </Box>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-accent-600 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-200">
            View Raw Configuration (JSON)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-surface-800 p-3 text-xs text-green-400">
            {JSON.stringify(config, null, 2)}
          </pre>
        </details>
      </Box>

      <Stack direction="row" gap={2}>
        <Button
          onClick={onApply}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Apply Configuration
        </Button>
        <Button
          onClick={onCopyJson}
          className="rounded bg-surface-600 px-4 py-2 text-white hover:bg-surface-700 focus:ring-2 focus:ring-accent-500 focus:outline-none"
        >
          Copy JSON
        </Button>
      </Stack>
    </Box>
  )
}
