import React from 'react'
import { fieldClasses } from './classes'

type ParkingFieldProps = {
  parkingInstructions: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export default function ParkingField({ parkingInstructions, onChange }: ParkingFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="parkingInstructions" className={fieldClasses.label}>
        Parking Instructions
      </label>
      <select
        aria-label="Parking Instructions"
        name="parkingInstructions"
        id="parkingInstructions"
        value={parkingInstructions}
        className={fieldClasses.select}
        onChange={onChange}
      >
        <option value="">Select parking option</option>
        <option value="street">Street Parking Available</option>
        <option value="garage">Parking Garage</option>
        <option value="valet">Valet Service</option>
        <option value="none">No Parking Needed</option>
      </select>
    </div>
  )
}
