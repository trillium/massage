import { directPrices, servicesWebsite, servicesAirbnb, coupons } from './constants'
import promo from '@/data/promo.json'
import { Box } from '@/components/ui/box'

export default function AirbnbCouponTable() {
  const getDirectPriceForService = (service: (typeof servicesAirbnb)[0]) => {
    // Find matching website service by duration
    const websiteService = servicesWebsite.find((s) => s.duration === service.duration)
    if (websiteService) {
      return directPrices[websiteService.duration as keyof typeof directPrices]
    }
    // For Thank You Offering (400), calculate based on hourly rate
    if (service.duration === 400) {
      return Math.round((directPrices[60] / 60) * 150) // 2.5 hours = 150 minutes
    }
    return 0
  }

  const formatComparison = (
    afterCoupon: number,
    directPrice: number,
    service: (typeof servicesAirbnb)[0]
  ) => {
    if (service.duration === 400 || service.duration === 150) {
      const hours = service.duration === 400 ? 2.5 : 2.5
      const hourlyRate = afterCoupon / hours
      return `~$${Math.round(hourlyRate)}/hr`
    }
    const diff = afterCoupon - directPrice
    return diff > 0 ? `+$${Math.round(diff)}` : `-$${Math.abs(Math.round(diff))}`
  }

  const getComparisonColor = (afterCoupon: number, directPrice: number) => {
    const diff = afterCoupon - directPrice
    if (diff > 0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <Box className="my-6 overflow-x-auto rounded-md">
      <table className="min-w-full border-collapse rounded-md border border-accent-300 text-sm dark:border-accent-700">
        <thead>
          <tr className="bg-surface-200 dark:bg-surface-800">
            <th className="border border-accent-300 px-3 py-2 text-left dark:border-accent-700">
              {promo.couponTable.columnHeading}
            </th>
            {servicesAirbnb.map((service) => {
              const directPrice = getDirectPriceForService(service)
              return (
                <th
                  key={`${service.duration}-${service.name}`}
                  className="border border-accent-300 px-3 py-2 text-left dark:border-accent-700"
                >
                  <Box className="font-semibold">{service.name}</Box>
                  {directPrice > 0 && (
                    <Box className="text-xs font-normal">
                      {promo.couponTable.directPrefix}
                      {directPrice}
                    </Box>
                  )}
                  <Box className="text-xs font-normal">
                    {promo.couponTable.airbnbPrefix}
                    {service.price}
                  </Box>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon, couponIndex) => (
            <tr
              key={couponIndex}
              className={couponIndex % 2 === 1 ? 'bg-surface-100 dark:bg-surface-900' : ''}
            >
              <td className="border border-accent-300 px-3 py-2 font-medium dark:border-accent-700">
                {coupon.discount}
              </td>
              {servicesAirbnb.map((service) => {
                const directPrice = getDirectPriceForService(service)
                const calculatedPrice = coupon.calc(service.price)
                const afterCoupon = Math.max(0, Math.round(calculatedPrice))
                const wastedValue =
                  coupon.type === 'Dollar Amount' && calculatedPrice < 0
                    ? Math.abs(Math.round(calculatedPrice))
                    : 0

                return (
                  <td
                    key={`${service.duration}-${service.name}`}
                    className="border border-accent-300 px-3 py-2 dark:border-accent-700"
                  >
                    <Box className="font-semibold">
                      {promo.couponTable.pricePrefix}
                      {afterCoupon}
                    </Box>
                    {directPrice > 0 && (
                      <Box className={`text-xs ${getComparisonColor(afterCoupon, directPrice)}`}>
                        {formatComparison(afterCoupon, directPrice, service)}
                      </Box>
                    )}
                    {wastedValue > 0 && (
                      <Box className="text-xs text-orange-600 italic dark:text-orange-400">
                        {promo.couponTable.pricePrefix}
                        {wastedValue} {promo.couponTable.unusedExcessSuffix}
                      </Box>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bg-blue-50 font-medium dark:bg-blue-950">
            <td className="border border-accent-300 px-3 py-2 dark:border-accent-700">
              {promo.couponTable.compensationRowLabel}
            </td>
            {servicesAirbnb.map((service) => {
              const myCompensation = (service.price * 0.85).toFixed(2) // 85% after 15% fee

              return (
                <td
                  key={`${service.duration}-${service.name}-compensation`}
                  className="border border-accent-300 px-3 py-2 dark:border-accent-700"
                >
                  <Box className="font-semibold">
                    {promo.couponTable.pricePrefix}
                    {myCompensation}
                  </Box>
                  <Box className="text-xs text-accent-600 dark:text-accent-400">
                    {promo.couponTable.compensationNotePrefix}
                    {service.price}
                    {promo.couponTable.compensationNoteSuffix}
                  </Box>
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </Box>
  )
}
