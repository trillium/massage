'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormikHelpers } from 'formik'
import { z } from 'zod'

import { DEFAULT_PRICING, ALLOWED_DURATIONS, DEFAULT_DURATION } from 'config'
import { getHash } from '@/lib/hash'
import type { SearchParamsType } from '@/lib/types'
import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import { setModal } from '@/redux/slices/modalSlice'
import { setDuration, setSelectedTime, setTimeZone } from '@/redux/slices/availabilitySlice'
import { setForm } from '@/redux/slices/formSlice'
import { setBulkConfigSliceState } from '@/redux/slices/configSlice'
import type { AppointmentRequestValidationResult } from '@/lib/handleAppointmentRequest'
import { AppointmentRequestSchema as schema } from '@/lib/schema'
import { AppointmentRequestType } from '@/lib/types'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import { buildDurationProps } from '@/lib/slugConfigurations/helpers/buildDurationProps'
import { buildBookingPayload } from 'components/booking/handleSubmit'
import { createLocationSchema } from 'components/booking/fields/validations/locationValidation'
import { testUser } from '../../testUser'
import { generateMockEmails } from './generateMockEmails'
import { paymentMethod } from '@/data/paymentMethods'

import { createBookingFormSchema, BookingFormValues } from '@/lib/bookingFormSchema'

type PageConfigResult = Awaited<ReturnType<typeof createPageConfiguration>>

export function useMockedUserFlow() {
  const dispatch = useAppDispatch()
  const { duration } = useReduxAvailability()
  const router = useRouter()

  // State management
  const [submittedData, setSubmittedData] = useState<AppointmentRequestType | null>(null)
  const [therapistEmail, setTherapistEmail] = useState<{ subject: string; body: string } | null>(
    null
  )
  const [clientEmail, setClientEmail] = useState<{ subject: string; body: string } | null>(null)
  const [approveUrl, setApproveUrl] = useState<string>('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [pageConfig, setPageConfig] = useState<PageConfigResult | null>(null)

  // Initialize using createPageConfiguration
  useEffect(() => {
    const initializeMockFlow = async () => {
      // Create mock search params for a typical booking
      const mockSearchParams: SearchParamsType = {
        duration: DEFAULT_DURATION.toString(),
      }

      try {
        const mockData = {
          start: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          busy: [], // No busy times
          timeZone: 'America/Los_Angeles',
        }

        const result = await createPageConfiguration({
          resolvedParams: mockSearchParams,
          mocked: mockData,
        })

        setPageConfig(result)

        // Initialize form with test user data
        dispatch(setForm(testUser))

        // Initialize Redux config with the configuration from createPageConfiguration
        if (result.configuration) {
          dispatch(setBulkConfigSliceState(result.configuration))
        }

        // Initialize duration
        dispatch(setDuration(result.duration || DEFAULT_DURATION))

        // Initialize timezone (fallback to default since timeZone may not exist on all data types)
        const timeZone = 'timeZone' in result.data ? result.data.timeZone : 'America/Los_Angeles'
        dispatch(setTimeZone(timeZone || 'America/Los_Angeles'))

        // Initialize mock selected time using actual slots if available
        if (result.slots && result.slots.length > 0) {
          // Use the first available slot
          const firstSlot = result.slots[0]
          dispatch(
            setSelectedTime({
              start: firstSlot.start,
              end: firstSlot.end,
            })
          )
        } else {
          // Fallback to manual mock time
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          tomorrow.setHours(14, 0, 0, 0)

          const endTime = new Date(tomorrow)
          endTime.setMinutes(endTime.getMinutes() + (result.duration || DEFAULT_DURATION))

          dispatch(
            setSelectedTime({
              start: tomorrow.toISOString(),
              end: endTime.toISOString(),
            })
          )
        }
      } catch (error) {
        console.error('Failed to initialize mock flow:', error)
        // Fallback to basic initialization
        dispatch(setForm(testUser))
        dispatch(setDuration(DEFAULT_DURATION))
        dispatch(setTimeZone('America/Los_Angeles'))
      }
    }

    initializeMockFlow()
  }, [dispatch])

  // Use durationProps from pageConfig if available, otherwise fallback
  const durationProps = buildDurationProps(duration || DEFAULT_DURATION, {
    bookingSlug: 'mock',
    type: 'area-wide' as const,
    title: 'Mock Booking Flow',
    text: 'Testing the complete booking flow with mock data',
    location: null,
    eventContainer: null,
    pricing: DEFAULT_PRICING,
    discount: null,
    leadTimeMinimum: 180,
    instantConfirm: false,
    acceptingPayment: true,
    allowedDurations: ALLOWED_DURATIONS,
  })

  const processFormData = async (formData: FormData) => {
    // Use buildBookingPayload to properly transform location fields
    const jsonData = buildBookingPayload(formData)

    const validationResult: AppointmentRequestValidationResult = schema.safeParse(jsonData)
    if (!validationResult.success) {
      console.error('[processFormData] Validation errors:', validationResult.error.issues)
      dispatch(setModal({ status: 'error' }))
      return
    }
    const { data } = validationResult

    // Use the validated data from schema - it's already the correct type
    setSubmittedData(data)

    // Generate approval URL with hash
    const origin = window.location.origin
    const confirmUrl = `${origin}/api/confirm/?data=${encodeURIComponent(
      JSON.stringify(data)
    )}&key=${getHash(JSON.stringify(data))}`
    setApproveUrl(confirmUrl)

    // Generate emails using actual form data
    const start = new Date(data.start as string)
    const end = new Date(data.end as string)

    const { therapistEmailData, clientEmailData } = await generateMockEmails({
      data,
      start,
      end,
      confirmUrl,
      duration,
      price: pageConfig?.configuration?.pricing || DEFAULT_PRICING,
    })

    setTherapistEmail(therapistEmailData)
    setClientEmail(clientEmailData)
  }

  const handleMockedSubmit = async (
    values: BookingFormValues,
    formikHelpers: FormikHelpers<BookingFormValues>
  ) => {
    // Create FormData from Formik values
    const formData = new FormData()
    formData.append('firstName', values.firstName)
    formData.append('lastName', values.lastName)
    formData.append('phone', values.phone)
    formData.append('email', values.email)
    formData.append('location', values.location.street)
    formData.append('city', values.location.city || '')
    formData.append('zipCode', values.location.zip)
    formData.append('paymentMethod', values.paymentMethod)
    if (values.hotelRoomNumber) formData.append('hotelRoomNumber', values.hotelRoomNumber)
    if (values.parkingInstructions)
      formData.append('parkingInstructions', values.parkingInstructions)
    if (values.additionalNotes) formData.append('additionalNotes', values.additionalNotes)
    if (values.start) formData.append('start', values.start)
    if (values.end) formData.append('end', values.end)
    formData.append('duration', values.duration.toString())
    if (values.price) formData.append('price', values.price.toString())
    if (values.timeZone) formData.append('timeZone', values.timeZone)
    if (values.eventBaseString) formData.append('eventBaseString', values.eventBaseString)
    if (values.eventMemberString) formData.append('eventMemberString', values.eventMemberString)
    if (values.bookingUrl) formData.append('bookingUrl', values.bookingUrl)
    if (values.promo) formData.append('promo', values.promo)

    // Directly call the mock processing function
    dispatch(setModal({ status: 'busy' }))

    setTimeout(async () => {
      try {
        await processFormData(formData)
        dispatch(setModal({ status: 'closed' }))
      } catch (error) {
        console.error('Mock submission error:', error)
        dispatch(setModal({ status: 'error' }))
      }
    }, 500)
  }

  const handleApprovalClick = () => {
    setIsConfirmed(true)
    // Scroll to confirmation section
    document.getElementById('confirmation-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleReset = () => {
    setSubmittedData(null)
    setTherapistEmail(null)
    setClientEmail(null)
    setApproveUrl('')
    setIsConfirmed(false)
    dispatch(setForm(testUser))
    dispatch(setDuration(90))

    // Scroll to top of page for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    selectedDuration: duration,
    durationProps,
    submittedData,
    therapistEmail,
    clientEmail,
    approveUrl,
    isConfirmed,
    handleMockedSubmit,
    handleApprovalClick,
    handleReset,
  }
}
