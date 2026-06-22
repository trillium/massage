import React from 'react'
import { fieldClasses } from './classes'
import booking from '@/data/booking.json'

import { Input } from '@/components/ui/input'
import { Box } from '@/components/ui/box'

const { phone: phoneCopy, telegram: telegramCopy } = booking.form

type ContactFieldsProps = {
  phone?: string
  telegramHandle?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function ContactFields({
  phone = '',
  telegramHandle = '',
  onChange,
}: ContactFieldsProps) {
  return (
    <Box className={fieldClasses.row}>
      <Box className={fieldClasses.flexRow}>
        <Box className={fieldClasses.flexHalfWidth}>
          <label htmlFor="phone" className={fieldClasses.label}>
            {phoneCopy.label}
          </label>
          <Input
            aria-label={phoneCopy.ariaLabel}
            autoComplete="tel"
            id="phone"
            name="phone"
            value={phone}
            className={fieldClasses.input}
            placeholder={phoneCopy.placeholder}
            onChange={onChange}
          />
        </Box>
        <Box className={fieldClasses.flexHalfWidth}>
          <label htmlFor="telegramHandle" className={fieldClasses.label}>
            {telegramCopy.label}
          </label>
          <Input
            aria-label={telegramCopy.ariaLabel}
            autoComplete="off"
            type="text"
            id="telegramHandle"
            name="telegramHandle"
            value={telegramHandle}
            className={fieldClasses.input}
            placeholder={telegramCopy.placeholder}
            onChange={onChange}
          />
        </Box>
      </Box>
    </Box>
  )
}
