import React from 'react'
import { PaymentMethodType } from 'lib/types'
import { paymentMethod } from 'data/paymentMethods'
import { fieldClasses } from './classes'

import { Input } from '@/components/ui/input'

import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

type PaymentMethodFieldProps = {
  selected: PaymentMethodType | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PaymentMethodField({ selected, onChange }: PaymentMethodFieldProps) {
  const selectedHint = paymentMethod.find((p) => p.value === selected)?.hint
  return (
    <Box>
      <TextBase className={fieldClasses.paymentTitle}>Intended payment method</TextBase>
      <fieldset className={fieldClasses.paymentFieldset}>
        <Box className={fieldClasses.paymentOptions}>
          {paymentMethod.map((payType) => (
            <Box key={payType.value} className={fieldClasses.radioContainer}>
              <Input
                id={payType.value}
                aria-label={payType.name}
                type="radio"
                value={payType.value}
                checked={selected === payType.value}
                className={fieldClasses.radio}
                onChange={onChange}
              />
              <label htmlFor={payType.value} className={fieldClasses.radioLabel}>
                {payType.name}
              </label>
            </Box>
          ))}
        </Box>
        <TextBase className={fieldClasses.paymentHint}>* {selectedHint}</TextBase>
      </fieldset>
    </Box>
  )
}
