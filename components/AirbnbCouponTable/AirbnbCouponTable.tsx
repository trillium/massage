import { directPrices, servicesWebsite, servicesAirbnb, coupons } from './constants'

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
    <div className="my-6 overflow-x-auto rounded-md">
      <table className="min-w-full border-collapse rounded-md border border-gray-300 text-sm dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-700">
              Discount
            </th>
            {servicesAirbnb.map((service) => {
              const directPrice = getDirectPriceForService(service)
              return (
                <th
                  key={`${service.duration}-${service.name}`}
                  className="border border-gray-300 px-3 py-2 text-left dark:border-gray-700"
                >
                  <div className="font-semibold">{service.name}</div>
                  {directPrice > 0 && (
                    <div className="text-xs font-normal">Direct: ${directPrice}</div>
                  )}
                  <div className="text-xs font-normal">Airbnb: ${service.price}</div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon, couponIndex) => (
            <tr
              key={couponIndex}
              className={couponIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900' : ''}
            >
              <td className="border border-gray-300 px-3 py-2 font-medium dark:border-gray-700">
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
                    className="border border-gray-300 px-3 py-2 dark:border-gray-700"
                  >
                    <div className="font-semibold">${afterCoupon}</div>
                    {directPrice > 0 && (
                      <div className={`text-xs ${getComparisonColor(afterCoupon, directPrice)}`}>
                        {formatComparison(afterCoupon, directPrice, service)}
                      </div>
                    )}
                    {wastedValue > 0 && (
                      <div className="text-xs text-orange-600 italic dark:text-orange-400">
                        ${wastedValue} unused excess
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bg-blue-50 font-medium dark:bg-blue-950">
            <td className="border border-gray-300 px-3 py-2 dark:border-gray-700">
              My Compensation from Airbnb
            </td>
            {servicesAirbnb.map((service) => {
              const myCompensation = (service.price * 0.85).toFixed(2) // 85% after 15% fee

              return (
                <td
                  key={`${service.duration}-${service.name}-compensation`}
                  className="border border-gray-300 px-3 py-2 dark:border-gray-700"
                >
                  <div className="font-semibold">${myCompensation}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    (85% of ${service.price})
                  </div>
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
