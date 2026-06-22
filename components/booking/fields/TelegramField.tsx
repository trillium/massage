import React from 'react'
import { fieldClasses } from './classes'
import booking from '@/data/booking.json'

import { Input } from '@/components/ui/input'
import { Box } from '@/components/ui/box'

const { telegram: copy } = booking.form

type TelegramFieldProps = {
  telegramHandle?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function TelegramField({ telegramHandle = '', onChange }: TelegramFieldProps) {
  return (
    <Box className={fieldClasses.row}>
      <label htmlFor="telegramHandle" className={fieldClasses.label}>
        {copy.label}
      </label>
      <Input
        aria-label={copy.ariaLabel}
        autoComplete="off"
        type="text"
        id="telegramHandle"
        name="telegramHandle"
        value={telegramHandle}
        className={fieldClasses.input}
        placeholder={copy.placeholder}
        onChange={onChange}
      />
    </Box>
  )
}
