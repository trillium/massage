'use client'

import React, { useState, useEffect } from 'react'
import { fetchSlugConfigurationData } from '@/lib/slugConfigurations/fetchSlugConfigurationData'
import { SlugConfigurationType } from '@/lib/types'
import { useAppDispatch } from '@/redux/hooks'
import { setBulkConfigSliceState } from '@/redux/slices/configSlice'
import { setEventContainers } from '@/redux/slices/eventContainersSlice'
import ConfigDetailsPanel from './configuration-tester/ConfigDetailsPanel'

type ConfigurationTesterProps = {
  onConfigurationChange?: (config: SlugConfigurationType, slug: string) => void
}

export default function ConfigurationTester({ onConfigurationChange }: ConfigurationTesterProps) {
  const [configurations, setConfigurations] = useState<{ [key: string]: SlugConfigurationType }>({})
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [selectedConfig, setSelectedConfig] = useState<SlugConfigurationType | null>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        const configs = await fetchSlugConfigurationData()
        setConfigurations(configs)

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

  const handleConfigurationChange = (slug: string) => {
    const config = configurations[slug]
    if (!config) return

    setSelectedSlug(slug)
    setSelectedConfig(config)

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

    onConfigurationChange?.(config, slug)
  }

  const handleCopyJson = () => {
    if (!selectedConfig) return
    navigator.clipboard.writeText(JSON.stringify(selectedConfig, null, 2))
    alert('Configuration copied to clipboard!')
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Configuration Tester
      </h2>

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

      {selectedConfig && (
        <ConfigDetailsPanel
          config={selectedConfig}
          slug={selectedSlug}
          onApply={() => handleConfigurationChange(selectedSlug)}
          onCopyJson={handleCopyJson}
        />
      )}
    </div>
  )
}
