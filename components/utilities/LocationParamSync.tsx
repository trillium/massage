'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { setLocation } from '@/redux/slices/configSlice'
import { parseLocationFromParams } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'

export default function LocationParamSync() {
  const dispatch = useAppDispatch()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const params = new URLSearchParams(window.location.search)
    const location = parseLocationFromParams(params)

    if (location.street || location.city || location.zip) {
      dispatch(setLocation(location))
    }
  }, [dispatch])

  return null
}
