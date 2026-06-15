import React from 'react'
import { fieldClasses } from './classes'
import booking from '@/data/booking.json'

import { Input } from '@/components/ui/input'

const { hotelRoomNumber: copy } = booking.form

type HotelFieldProps = {
  hotelRoomNumber: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function HotelField({ hotelRoomNumber, onChange }: HotelFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="hotelRoomNumber" className={fieldClasses.label}>
        {copy.label}
      </label>
      <Input
        aria-label={copy.ariaLabel}
        required
        autoComplete="off"
        aria-required
        type="text"
        id="hotelRoomNumber"
        value={hotelRoomNumber}
        className={fieldClasses.input}
        placeholder={copy.placeholder}
        onChange={onChange}
      />
    </div>
  )
}
