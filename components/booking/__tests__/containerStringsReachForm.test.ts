import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBookingInitialValues } from '../useBookingInitialValues'
import { generateContainerStrings } from '@/lib/slugConfigurations/helpers/generateContainerStrings'
import { initialEventContainerState } from '@/redux/slices/eventContainersSlice'
import type { SlugConfigurationType } from 'lib/configTypes'

vi.mock('data/siteMetadata', () => ({
  default: { eventBaseString: '__EVENT__' },
}))

const emptyFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  paymentMethod: 'cash',
}

const scale23xConfig = {
  eventContainer: 'scale23x',
  bookingSlug: 'scale23x',
  instantConfirm: true,
} as SlugConfigurationType

const baseHookParams = {
  formData: emptyFormData as any,
  eventContainers: initialEventContainerState,
  config: scale23xConfig,
  selectedTime: { start: '2024-06-15T10:00:00Z', end: '2024-06-15T11:00:00Z' },
  timeZone: 'America/Los_Angeles',
  duration: 60,
  acceptingPayment: false,
  price: 0,
}

describe('container-scoped booking form values', () => {
  it('uses container-scoped eventBaseString for scale23x slug', () => {
    const { result } = renderHook(() => useBookingInitialValues(baseHookParams))

    expect(result.current.eventBaseString).toBe('scale23x__EVENT__')
  })

  it('includes eventMemberString for scale23x slug', () => {
    const { result } = renderHook(() => useBookingInitialValues(baseHookParams))

    expect(result.current.eventMemberString).toBe('scale23x__EVENT__MEMBER__')
  })
})
