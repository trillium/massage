import React from 'react'
import { PaymentMethodType } from 'lib/types'
import { paymentMethod } from 'data/paymentMethods'
import { fieldClasses } from './classes'

import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { Radio } from '@/components/ui/radio'

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
              <Radio
                id={payType.value}
                name="paymentMethod"
                label={payType.name}
                value={payType.value}
                checked={selected === payType.value}
                onChange={onChange}
              />
            </Box>
          ))}
        </Box>
        <TextBase className={fieldClasses.paymentHint}>* {selectedHint}</TextBase>
      </fieldset>
    </Box>
  )
}
