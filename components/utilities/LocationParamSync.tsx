'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setLocation } from '@/redux/slices/configSlice'
import { parseLocationFromParams } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'

export default function LocationParamSync() {
  const dispatch = useAppDispatch()
  const locationIsReadOnly = useAppSelector((state) => state.config.locationIsReadOnly)
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current || locationIsReadOnly) return
    didRun.current = true

    const params = new URLSearchParams(window.location.search)
    const location = parseLocationFromParams(params)

    if (location.street || location.city || location.zip) {
      dispatch(setLocation(location))
    }
  }, [dispatch, locationIsReadOnly])

  return null
}
