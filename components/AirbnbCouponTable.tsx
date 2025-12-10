import { DEFAULT_PRICING } from 'config'

export default function AirbnbCouponTable() {
  // Direct booking prices from config
  const directPrices = {
    60: DEFAULT_PRICING[60], // $140
    90: DEFAULT_PRICING[90], // $210
    120: DEFAULT_PRICING[120], // $280
    150: DEFAULT_PRICING[150], // $350
  }

  // Airbnb prices (approximately 15% higher due to fees)
  const airbnbPrices = {
    60: 160,
    90: 240,
    120: 320,
    150: 400,
  }

  const servicesWebsite = [
    { duration: 60, name: '60-Minute Massage' },
    { duration: 90, name: '90-Minute Massage' },
    { duration: 120, name: '120-Minute Massage' },
    { duration: 150, name: 'Massage Therapy Instructional (2.5hr)' },
  ]

  const servicesAirbnb = [
    { duration: 60, name: '60-Minute Massage', price: 150 },
    { duration: 90, name: '90-Minute Massage', price: 225 },
    { duration: 120, name: '120-Minute Massage', price: 300 },
    { duration: 150, name: 'Massage Therapy Instructional (2hr)', price: 300 },
    { duration: 400, name: 'Thank You Offering', price: 400 },
  ]

  const coupons = [
    {
      type: 'Percentage',
      discount: '10% off',
      calc: (price: number) => price * 0.9,
    },
    {
      type: 'Percentage',
      discount: '15% off',
      calc: (price: number) => price * 0.85,
    },
    {
      type: 'Percentage',
      discount: '20% off',
      calc: (price: number) => price * 0.8,
    },
    {
      type: 'Percentage',
      discount: '25% off',
      calc: (price: number) => price * 0.75,
    },
    {
      type: 'Percentage',
      discount: '30% off',
      calc: (price: number) => price * 0.7,
    },
    {
      type: 'Percentage',
      discount: '40% off',
      calc: (price: number) => price * 0.6,
    },
    {
      type: 'Percentage',
      discount: '50% off',
      calc: (price: number) => price * 0.5,
    },
    {
      type: 'Dollar Amount',
      discount: '$50 off',
      calc: (price: number) => price - 50,
    },
    {
      type: 'Dollar Amount',
      discount: '$100 off',
      calc: (price: number) => price - 100,
    },
    {
      type: 'Dollar Amount',
      discount: '$200 off',
      calc: (price: number) => price - 200,
    },
  ]

  const getDirectPriceForService = (service: (typeof servicesAirbnb)[0]) => {
    // Find matching website service by duration
    const websiteService = servicesWebsite.find((s) => s.duration === service.duration)
    if (websiteService) {
      return directPrices[websiteService.duration as keyof typeof directPrices]
    }
    // For Thank You Offering (400), calculate based on hourly rate
    if (service.duration === 400) {
      return Math.round((DEFAULT_PRICING[60] / 60) * 150) // 2.5 hours = 150 minutes
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
