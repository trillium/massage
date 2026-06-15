import React from 'react'
import { fieldClasses } from './classes'
import booking from '@/data/booking.json'

import { Select } from '@/components/ui/select'

const { parkingInstructions: copy } = booking.form

type ParkingFieldProps = {
  parkingInstructions: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export default function ParkingField({ parkingInstructions, onChange }: ParkingFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="parkingInstructions" className={fieldClasses.label}>
        {copy.label}
      </label>
      <Select
        aria-label={copy.ariaLabel}
        autoComplete="off"
        aria-required
        id="parkingInstructions"
        value={parkingInstructions}
        className={fieldClasses.input}
        onChange={onChange}
      >
        <option value="">{copy.options.empty}</option>
        <option value="street">{copy.options.street}</option>
        <option value="garage">{copy.options.garage}</option>
        <option value="valet">{copy.options.valet}</option>
        <option value="none">{copy.options.none}</option>
      </Select>
    </div>
  )
}
