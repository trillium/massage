import React from 'react'

type ParkingFieldProps = {
  parkingInstructions: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export default function ParkingField({ parkingInstructions, onChange }: ParkingFieldProps) {
  return (
    <div className="relative px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400">
      <label
        htmlFor="parkingInstructions"
        className="block text-xs font-medium text-gray-900 dark:text-gray-100"
      >
        Parking Instructions
      </label>
      <select
        aria-label="Parking Instructions"
        name="parkingInstructions"
        id="parkingInstructions"
        value={parkingInstructions}
        className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-sm sm:leading-6"
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
