import React from 'react'
import { fieldClasses } from './classes'

type HotelFieldProps = {
  hotelRoomNumber: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function HotelField({ hotelRoomNumber, onChange }: HotelFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="hotelRoomNumber" className={fieldClasses.label}>
        Hotel Room Number
      </label>
      <input
        aria-label="Hotel Room Number"
        required
        autoComplete="off"
        aria-required
        type="text"
        name="hotelRoomNumber"
        id="hotelRoomNumber"
        value={hotelRoomNumber}
        className={fieldClasses.input}
        placeholder="e.g. 1205"
        onChange={onChange}
      />
    </div>
  )
}
