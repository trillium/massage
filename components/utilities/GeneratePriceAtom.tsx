import { DiscountType } from '@/lib/types'
import clsx from 'clsx'

type GeneratePriceType = { price: number; discount?: DiscountType | null }

export function GeneratePrice({ price, discount }: GeneratePriceType) {
  let discountPrice
  if (discount) {
    const { amountDollars, amountPercent } = discount
    if (discount?.type === 'dollar' && amountDollars !== undefined) {
      discountPrice = price - amountDollars
    } else if (discount?.type === 'percent' && amountPercent !== undefined) {
      discountPrice = Math.floor(price * (1 - amountPercent))
    }
  }
  return (
    <>
      <span
        className={clsx({
          'line-through decoration-red-500 decoration-2': !!discount,
        })}
      >
        ${price}
      </span>
      {!!discount && (
        <>
          {' '}
          {'->  '} <span>${discountPrice}</span>
        </>
      )}
    </>
  )
}
