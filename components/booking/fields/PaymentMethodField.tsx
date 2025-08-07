import React from 'react'
import { PaymentMethodType } from 'lib/types'
import { paymentMethod } from 'data/paymentMethods'
import { fieldClasses } from './classes'

type PaymentMethodFieldProps = {
  selected: PaymentMethodType | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PaymentMethodField({ selected, onChange }: PaymentMethodFieldProps) {
  const selectedHint = paymentMethod.find((p) => p.value === selected)?.hint
  return (
    <div>
      <p className={fieldClasses.paymentTitle}>Intended payment method</p>
      <fieldset className={fieldClasses.paymentFieldset}>
        <div className={fieldClasses.paymentOptions}>
          {paymentMethod.map((payType) => (
            <div key={payType.value} className={fieldClasses.radioContainer}>
              <input
                id={payType.value}
                aria-label={payType.name}
                name="paymentMethod"
                type="radio"
                value={payType.value}
                checked={selected === payType.value}
                className={fieldClasses.radio}
                onChange={onChange}
              />
              <label htmlFor={payType.value} className={fieldClasses.radioLabel}>
                {payType.name}
              </label>
            </div>
          ))}
        </div>
        <p className={fieldClasses.paymentHint}>* {selectedHint}</p>
      </fieldset>
    </div>
  )
}
