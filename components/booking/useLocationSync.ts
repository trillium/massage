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
  const pendingLocation = useRef<LocationObject | string | null>(null)

  const setFormikLocation = (configLocation: LocationObject | string | null) => {
    if (configLocation && formikRef.current) {
      const newLocation: LocationObject =
        typeof configLocation === 'string'
          ? stringToLocationObject(configLocation)
          : {
              street: configLocation.street || '',
              city: configLocation.city || '',
              zip: configLocation.zip || '',
            }

      formikRef.current.setFieldValue('location', newLocation)
    }
  }

  useEffect(() => {
    if (config.location) {
      if (formikRef.current) {
        setFormikLocation(config.location)
      } else {
        pendingLocation.current = config.location
      }
    }
  }, [config.location])

  useEffect(() => {
    if (eventContainers?.location) {
      if (formikRef.current) {
        setFormikLocation(eventContainers.location)
      } else {
        pendingLocation.current = eventContainers.location
      }
    }
  }, [eventContainers?.location])

  const processPendingUpdates = (setFieldValue: (field: string, value: unknown) => void) => {
    formikRef.current = { setFieldValue }

    if (pendingLocation.current) {
      setFormikLocation(pendingLocation.current)
      pendingLocation.current = null
    }
  }

  return { formikRef, processPendingUpdates, setFormikLocation }
}
