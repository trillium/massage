'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch, useReduxFormData } from '@/redux/hooks'
import { setBookingForm } from '@/redux/slices/bookingFormSlice'
import { loadPersistedState, saveFormData } from '@/redux/persistence'

export default function FormPersistenceManager() {
  const dispatch = useAppDispatch()
  const formData = useReduxFormData()
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    const persisted = loadPersistedState()
    if (persisted?.form) {
      dispatch(setBookingForm(persisted.form as Parameters<typeof setBookingForm>[0]))
    }
  }, [dispatch])

  useEffect(() => {
    if (!loadedRef.current) return
    saveFormData(formData)
  }, [formData])

  return null
}
