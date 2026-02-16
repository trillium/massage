import { useEffect, useRef } from 'react'
import { LocationObject } from 'lib/types'
import { stringToLocationObject } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import { SlugConfigurationType } from 'lib/configTypes'
import { EventContainerType } from '@/redux/slices/eventContainersSlice'

type FormikRef = {
  setFieldValue: (field: string, value: unknown) => void
} | null

export function useLocationSync(
  config: SlugConfigurationType,
  eventContainers: EventContainerType
) {
  const formikRef = useRef<FormikRef>(null)

  const pendingLocationUpdate = useRef<{
    location: LocationObject | string | null
    source: string
  } | null>(null)

  const setFormikLocation = (configLocation: LocationObject | string | null, source: string) => {
    if (configLocation && formikRef.current) {
      let newLocation: LocationObject

      if (typeof configLocation === 'string') {
        newLocation = stringToLocationObject(configLocation)
      } else {
        newLocation = {
          street: configLocation.street || '',
          city: configLocation.city || '',
          zip: configLocation.zip || '',
        }
      }

      formikRef.current.setFieldValue('location', newLocation)
    }
  }

  useEffect(() => {
    if (config.location) {
      if (formikRef.current) {
        setFormikLocation(config.location, 'config.location useEffect')
      } else {
        pendingLocationUpdate.current = {
          location: config.location,
          source: 'config.location useEffect (delayed)',
        }
      }
    }
  }, [config.location])

  useEffect(() => {
    if (eventContainers?.location) {
      if (formikRef.current) {
        setFormikLocation(eventContainers.location, 'eventContainers.location useEffect')
      } else {
        pendingLocationUpdate.current = {
          location: eventContainers.location,
          source: 'eventContainers.location useEffect (delayed)',
        }
      }
    }
  }, [eventContainers?.location])

  const processPendingUpdates = (setFieldValue: (field: string, value: unknown) => void) => {
    formikRef.current = { setFieldValue }

    if (pendingLocationUpdate.current) {
      const { location, source } = pendingLocationUpdate.current
      setFormikLocation(location, source)
      pendingLocationUpdate.current = null
    }
  }

  return { formikRef, processPendingUpdates, setFormikLocation }
}
