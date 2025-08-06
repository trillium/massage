import React from 'react'

type HotelFieldProps = {
  hotelRoomNumber: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function HotelField({ hotelRoomNumber, onChange }: HotelFieldProps) {
  return (
    <div className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
      <label
        htmlFor="hotelRoomNumber"
        className="block text-xs font-medium text-gray-900 dark:text-gray-100"
      >
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
        className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-100"
        placeholder="e.g. 1205"
        onChange={onChange}
      />
    </div>
  )
}
