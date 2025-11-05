'use client'

import * as React from 'react'
import LocationField from '@/components/booking/fields/LocationField'
import { useAppDispatch, useReduxFormData, useReduxAvailability } from '@/redux/hooks'
import { setForm } from '@/redux/slices/formSlice'
import { setDriveTime } from '@/redux/slices/availabilitySlice'
import { GoogleCalendarV3Event, LocationObject } from '@/lib/types'

function formatDriveTime(minutes: number): string {
  if (minutes <= 5) return 'Extremely short'
  if (minutes <= 10) return 'Pretty short'
  if (minutes <= 20) return 'Short'
  if (minutes <= 30) return 'Medium'
  if (minutes <= 40) return 'A little long'
  if (minutes <= 50) return 'A bit long'
  if (minutes <= 60) return 'Long'
  return 'More than an hour'
}

interface DriveTimeCalculatorProps {
  currentEvent: GoogleCalendarV3Event | null
}

export default function DriveTimeCalculator({ currentEvent }: DriveTimeCalculatorProps) {
  const dispatch = useAppDispatch()
  const formData = useReduxFormData()
  const { driveTime } = useReduxAvailability()
  const [isCalculating, setIsCalculating] = React.useState(false)
  const [isGettingLocation, setIsGettingLocation] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [deviceCoordinates, setDeviceCoordinates] = React.useState<{
    lat: number
    lng: number
  } | null>(null)
  const [driveTimeIsStale, setDriveTimeIsStale] = React.useState(false)
  const [validationErrors, setValidationErrors] = React.useState<{
    zip?: string
  }>({})

  const location: LocationObject = React.useMemo(() => {
    if (formData.location && typeof formData.location !== 'string') {
      return formData.location
    }
    return { street: '', city: '', zip: '' }
  }, [formData.location])

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldName = name === 'location' ? 'street' : name === 'zipCode' ? 'zip' : name

    const updatedLocation = {
      ...location,
      [fieldName]: value,
    }

    if (fieldName === 'zip') {
      const zipPattern = /^\d{5}(-\d{4})?$/
      if (value && !zipPattern.test(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          zip: 'Please enter a valid 5-digit ZIP code',
        }))
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          zip: undefined,
        }))
      }
    }

    dispatch(setForm({ location: updatedLocation }))
  }

  const handleUseDeviceLocation = async () => {
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const coords = { lat: latitude, lng: longitude }
        setDeviceCoordinates(coords)
        setIsGettingLocation(false)
        setError(null)

        // Auto-calculate drive time with coordinates
        setIsCalculating(true)
        try {
          const response = await fetch('/api/driveTime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: currentEvent?.id,
              userCoordinates: coords,
            }),
          })

          const data = await response.json()
          if (data.success) {
            dispatch(setDriveTime(data.driveTimeMinutes))
            setDriveTimeIsStale(false)
          } else {
            setError(data.error || 'Failed to calculate drive time')
          }
        } catch (error) {
          console.error('Error calculating drive time:', error)
          setError('Error calculating drive time')
        } finally {
          setIsCalculating(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Could not get your location. Please check your browser permissions.')
        setIsGettingLocation(false)
      }
    )
  }

  const handleCalculate = async () => {
    const hasAddress = location.street && location.city && location.zip
    const hasCoordinates = deviceCoordinates !== null

    if (!hasAddress && !hasCoordinates) return
    if (validationErrors.zip) return

    setIsCalculating(true)
    setError(null)
    try {
      const payload: {
        eventId?: string
        userLocation?: string
        userCoordinates?: { lat: number; lng: number }
      } = {
        eventId: currentEvent?.id,
      }

      if (deviceCoordinates) {
        payload.userCoordinates = deviceCoordinates
      } else {
        payload.userLocation = `${location.street}, ${location.city}, CA ${location.zip}`
      }

      const response = await fetch('/api/driveTime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        dispatch(setDriveTime(data.driveTimeMinutes))
        setDriveTimeIsStale(false)
      } else {
        setError(data.error || 'Failed to calculate drive time')
      }
    } catch (error) {
      console.error('Error calculating drive time:', error)
      setError('Error calculating drive time')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="focus-within:border-primary-500 dark:focus-within:border-primary-500 rounded-lg border-2 border-gray-300 bg-slate-100 p-6 dark:border-gray-700 dark:bg-slate-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base leading-6 font-semibold text-gray-900 dark:text-gray-100">
          Want to be next? Calculate Drive Time
        </h3>
        <button
          onClick={handleUseDeviceLocation}
          disabled={isGettingLocation}
          className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
        >
          {isGettingLocation ? 'Getting Location...' : 'Use Device Location'}
        </button>
      </div>
      {deviceCoordinates ? (
        <div className="rounded-md border-2 border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/50">
          <p className="text-sm text-blue-800 dark:text-blue-400">
            <strong>Device Location:</strong> {deviceCoordinates.lat.toFixed(6)},{' '}
            {deviceCoordinates.lng.toFixed(6)}
          </p>
        </div>
      ) : (
        <div className="isolate -space-y-px rounded-md shadow-sm">
          <LocationField
            location={location}
            readOnly={false}
            onChange={handleLocationChange}
            errors={validationErrors}
          />
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-md border-2 border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}
      <button
        onClick={
          deviceCoordinates
            ? () => {
                setDeviceCoordinates(null)
                setDriveTimeIsStale(true)
              }
            : handleCalculate
        }
        disabled={
          !deviceCoordinates &&
          (isCalculating ||
            !location.street ||
            !location.city ||
            !location.zip ||
            !!validationErrors.zip)
        }
        className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 mt-4 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
      >
        {deviceCoordinates
          ? 'Clear and use manual address'
          : isCalculating
            ? 'Calculating...'
            : 'Calculate Drive Time'}
      </button>
      {driveTime !== null && (
        <div
          className={
            driveTimeIsStale
              ? 'mt-4 rounded-md border-2 border-gray-300 bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-900/50'
              : 'mt-4 rounded-md border-2 border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/50'
          }
        >
          <p
            className={
              driveTimeIsStale
                ? 'text-sm text-gray-600 dark:text-gray-400'
                : 'text-sm text-green-800 dark:text-green-400'
            }
          >
            Drive time: <strong>{formatDriveTime(driveTime)}</strong>
            {driveTimeIsStale && ' (from previous location)'}
          </p>
        </div>
      )}
    </div>
  )
}
