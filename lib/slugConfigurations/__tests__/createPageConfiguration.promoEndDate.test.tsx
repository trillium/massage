import { describe, it, expect, vi } from 'vitest'
import { createPageConfiguration } from '../createPageConfiguration'
import { initialState } from '@/redux/slices/configSlice'
import { SearchParamsType } from '@/lib/types'

describe('createPageConfiguration promoEndDate limiting', () => {
  it('limits end date to promoEndDate when normal window would extend past', async () => {
    const bookingSlug = 'test-promo'
    const promoEndDate = '2025-07-30'
    const fakeConfig = {
      ...initialState,
      promoEndDate,
      type: 'scheduled-site' as const,
      bookingSlug,
      title: null,
      text: null,
      location: null,
      eventContainer: null,
      eventBaseString: '',
      eventMemberString: '',
      eventContainerString: '',
      price: null,
      allowedDurations: null,
      acceptingPayment: false,
      leadTimeMinimum: null,
      locationIsReadOnly: false,
    }
    const fakeData = {
      start: '2025-07-20',
      end: '2025-08-05', // normal window would go past promoEndDate
      busy: [],
      data: {},
      containers: [],
    }
    vi.spyOn(
      await import('../fetchSlugConfigurationData'),
      'fetchSlugConfigurationData'
    ).mockResolvedValue({ [bookingSlug]: fakeConfig })
    vi.spyOn(
      await import('@/lib/fetch/fetchContainersByQuery'),
      'fetchContainersByQuery'
    ).mockResolvedValue(fakeData)

    const result = await createPageConfiguration({
      bookingSlug,
      resolvedParams: {} as SearchParamsType,
    })
    expect(result.end).toMatchObject({ year: 2025, month: 7, day: 30 })
  })
})
