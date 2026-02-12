export interface Promotion {
  id: string
  name: string
  endDate: string
  promoCode?: string
  discount: string
  platform: 'airbnb' | 'soothe' | 'website'
  blogSlug?: string
}

export const promotions: Promotion[] = [
  {
    id: 'airbnb-merci50-2025',
    name: '50% Off Massage Through Airbnb',
    endDate: '2025-12-04',
    promoCode: 'MERCI50',
    discount: '50% off (up to $200)',
    platform: 'airbnb',
    blogSlug: 'airbnb-50-percent-promo',
  },
  {
    id: 'airbnb-100-dollars-off',
    name: '50% Off Massage Through Airbnb',
    endDate: '2026-01-01',
    promoCode: 'LAHOLIDAY25!',
    discount: '$100 off ($150 minimum)',
    platform: 'airbnb',
    blogSlug: 'airbnb-100-dollars-off',
  },
]

export const getActivePromotions = (currentDate = new Date()): Promotion[] => {
  return promotions.filter((promo) => {
    const endDate = new Date(promo.endDate)
    endDate.setHours(23, 59, 59, 999)
    return currentDate <= endDate
  })
}

export const isPromotionActive = (endDate: string, currentDate = new Date()): boolean => {
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  return currentDate <= end
}
