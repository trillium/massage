'use client'

import React, { useState, useEffect } from 'react'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { SlugConfigurationType } from '@/lib/types'
import { FaExclamationTriangle } from 'react-icons/fa'
import { useAppDispatch } from '@/redux/hooks'
import {
  setBulkConfigSliceState,
  setLocation,
  setPrice,
  setAllowedDurations,
  setLeadTimeMinimum,
  setDiscount,
  setLocationReadOnly,
  setLocationWarning,
  setEventContainer,
  setBlockingScope,
} from '@/redux/slices/configSlice'
import { setEventContainers } from '@/redux/slices/eventContainersSlice'

type ConfigurationTesterProps = {
  onConfigurationChange?: (config: SlugConfigurationType, slug: string) => void
}

export default function ConfigurationTester({ onConfigurationChange }: ConfigurationTesterProps) {
  const [configurations, setConfigurations] = useState<{ [key: string]: SlugConfigurationType }>({})
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [selectedConfig, setSelectedConfig] = useState<SlugConfigurationType | null>(null)
  const dispatch = useAppDispatch()

  // Load configurations on mount
  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        const configs = await fetchSlugConfigurationData()
        setConfigurations(configs)

        // Set the first configuration as default
        const firstSlug = Object.keys(configs)[0]
        if (firstSlug) {
          setSelectedSlug(firstSlug)
          setSelectedConfig(configs[firstSlug])
        }
      } catch (error) {
        console.error('Failed to load configurations:', error)
      }
    }

    loadConfigurations()
  }, [])

  // Handle configuration change
  const handleConfigurationChange = (slug: string) => {
    const config = configurations[slug]
    if (config) {
      setSelectedSlug(slug)
      setSelectedConfig(config)

      // Update Redux state with the selected configuration
      dispatch(
        setBulkConfigSliceState({
          location: config.location,
          pricing: config.pricing,
          allowedDurations: config.allowedDurations,
          leadTimeMinimum: config.leadTimeMinimum,
          discount: config.discount,
          title: config.title,
          text: config.text,
          locationIsReadOnly: config.locationIsReadOnly,
          customFields: config.customFields,
          promoEndDate: config.promoEndDate,
          type: config.type,
          bookingSlug: config.bookingSlug,
          eventContainer: config.eventContainer,
          blockingScope: config.blockingScope,
          instantConfirm: config.instantConfirm,
          acceptingPayment: config.acceptingPayment,
        })
      )

      // Set event container data if available
      if (config.eventContainer) {
        dispatch(
          setEventContainers({
            eventBaseString: config.eventContainer + '__EVENT__',
            eventMemberString: config.eventContainer + '__EVENT__MEMBER__',
            eventContainerString: config.eventContainer + '__EVENT__CONTAINER__',
            location: config.location,
          })
        )
      }

      // Call callback if provided
      if (onConfigurationChange) {
        onConfigurationChange(config, slug)
      }
    }
  }

  // Format configuration data for display
  const formatConfigData = (config: SlugConfigurationType) => {
    return {
      type: config.type,
      title: config.title,
      text: config.text,
      location: config.location,
      pricing: config.pricing,
      allowedDurations: config.allowedDurations,
      leadTimeMinimum: config.leadTimeMinimum,
      discount: config.discount,
      eventContainer: config.eventContainer,
      blockingScope: config.blockingScope,
      locationIsReadOnly: config.locationIsReadOnly,
      locationWarning: config.locationWarning,
      customFields: config.customFields,
      promoEndDate: config.promoEndDate,
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Configuration Tester
      </h2>

      {/* Configuration Selector */}
      <div className="mb-6">
        <label
          htmlFor="config-select"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Select Configuration:
        </label>
        <select
          id="config-select"
          value={selectedSlug}
          onChange={(e) => handleConfigurationChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="" disabled>
            Select a configuration...
          </option>
          {Object.entries(configurations).map(([slug, config]) => (
            <option key={slug} value={slug}>
              {slug} ({config.type}) {config.title ? `- ${config.title}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Configuration Details */}
      {selectedConfig && (
        <div className="space-y-4">
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-700">
            <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
              Configuration Details for:{' '}
              <code className="rounded bg-gray-200 px-2 py-1 text-sm dark:bg-gray-600">
                {selectedSlug}
              </code>
            </h3>

            {/* Key Properties */}
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Type:</strong>
                <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                  {selectedConfig.type}
                </span>
              </div>

              {selectedConfig.eventContainer && (
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">Event Container:</strong>
                  <span className="ml-2 rounded bg-green-100 px-2 py-1 text-sm text-green-800 dark:bg-green-800 dark:text-green-200">
                    {selectedConfig.eventContainer}
                  </span>
                </div>
              )}

              {selectedConfig.blockingScope && (
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">Blocking Scope:</strong>
                  <span className="ml-2 rounded bg-purple-100 px-2 py-1 text-sm text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                    {selectedConfig.blockingScope}
                  </span>
                </div>
              )}

              {selectedConfig.leadTimeMinimum && (
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">Lead Time:</strong>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {selectedConfig.leadTimeMinimum} hours
                  </span>
                </div>
              )}
            </div>

            {/* Title and Text */}
            {selectedConfig.title && (
              <div className="mb-3">
                <strong className="text-gray-700 dark:text-gray-300">Title:</strong>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedConfig.title}</p>
              </div>
            )}

            {selectedConfig.text && (
              <div className="mb-3">
                <strong className="text-gray-700 dark:text-gray-300">Text:</strong>
                {Array.isArray(selectedConfig.text) ? (
                  selectedConfig.text.map((paragraph, index) => (
                    <p key={index} className="mt-1 text-gray-600 dark:text-gray-400">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedConfig.text}</p>
                )}
              </div>
            )}

            {/* Location */}
            {selectedConfig.location && (
              <div className="mb-3">
                <strong className="text-gray-700 dark:text-gray-300">Location:</strong>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {selectedConfig.location.street}, {selectedConfig.location.city},{' '}
                  {selectedConfig.location.zip}
                  {selectedConfig.locationIsReadOnly && (
                    <span className="ml-2 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                      Read Only
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Location Warning */}
            {selectedConfig.locationWarning && (
              <div className="mb-3">
                <strong className="text-gray-700 dark:text-gray-300">Location Warning:</strong>
                <div className="mt-1 rounded border-2 border-amber-200 bg-amber-50 p-2 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-200 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                      {'city' in selectedConfig.locationWarning
                        ? `CITY: ${selectedConfig.locationWarning.city}`
                        : `ZIP: ${selectedConfig.locationWarning.zip}`}
                    </span>
                    <span>
                      <FaExclamationTriangle className="mr-1 inline text-amber-500" />{' '}
                      {selectedConfig.locationWarning.message}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            {selectedConfig.pricing && Object.keys(selectedConfig.pricing).length > 0 && (
              <div className="mb-3">
                <strong className="text-gray-700 dark:text-gray-300">Custom Pricing:</strong>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(selectedConfig.pricing).map(([duration, price]) => (
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

            {/* Discount */}
            {selectedConfig.discount && (
              <div className="mb-3">
                <strong className="text-gray-700 dark:text-gray-300">Discount:</strong>
                <span className="ml-2 rounded bg-red-100 px-2 py-1 text-sm text-red-800 dark:bg-red-800 dark:text-red-200">
                  {selectedConfig.discount.type === 'percent' &&
                  selectedConfig.discount.amountPercent
                    ? `${(selectedConfig.discount.amountPercent * 100).toFixed(0)}% off`
                    : selectedConfig.discount.amountDollars
                      ? `$${selectedConfig.discount.amountDollars} off`
                      : 'Discount applied'}
                </span>
              </div>
            )}

            {/* Promo End Date */}
            {selectedConfig.promoEndDate && (
              <div className="mb-3">
                <strong className="text-gray-700 dark:text-gray-300">Promo Ends:</strong>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {selectedConfig.promoEndDate}
                </span>
              </div>
            )}

            {/* Custom Fields */}
            {selectedConfig.customFields && (
              <div className="mb-3">
                <strong className="text-gray-700 dark:text-gray-300">Custom Fields:</strong>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedConfig.customFields.showHotelField && (
                    <span className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">
                      Hotel Field
                    </span>
                  )}
                  {selectedConfig.customFields.showParkingField && (
                    <span className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">
                      Parking Field
                    </span>
                  )}
                  {selectedConfig.customFields.showNotesField && (
                    <span className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">
                      Notes Field
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Raw JSON (for debugging) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                View Raw Configuration (JSON)
              </summary>
              <pre className="mt-2 overflow-x-auto rounded bg-gray-800 p-3 text-xs text-green-400">
                {JSON.stringify(formatConfigData(selectedConfig), null, 2)}
              </pre>
            </details>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleConfigurationChange(selectedSlug)}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Apply Configuration
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(formatConfigData(selectedConfig), null, 2)
                )
                alert('Configuration copied to clipboard!')
              }}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
              Copy JSON
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
