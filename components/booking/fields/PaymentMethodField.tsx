import React from 'react'
import { PaymentMethodType } from 'lib/types'
import { paymentMethod } from 'data/paymentMethods'

type PaymentMethodFieldProps = {
  selected: PaymentMethodType | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PaymentMethodField({ selected, onChange }: PaymentMethodFieldProps) {
  const selectedHint = paymentMethod.find((p) => p.value === selected)?.hint
  return (
    <div>
      <p className="text-sm font-medium">Intended payment method</p>
      <fieldset className="mt-2">
        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
          {paymentMethod.map((payType) => (
            <div key={payType.value} className="flex items-center">
              <input
                id={payType.value}
                aria-label={payType.name}
                name="paymentMethod"
                type="radio"
                value={payType.value}
                checked={selected === payType.value}
                className="text-primary-600 focus:ring-primary-400 h-4 w-4 border-gray-300"
                onChange={onChange}
              />
              <label
                htmlFor={payType.value}
                className="ml-1.5 block text-sm leading-6 text-gray-800 dark:text-gray-100"
              >
                {payType.name}
              </label>
            </div>
          ))}
        </div>
        <p className="pl-4 text-sm text-gray-500 dark:text-gray-300">* {selectedHint}</p>
      </fieldset>
    </div>
  )
}
