import React from 'react'

type PhoneFieldProps = {
  phone: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PhoneField({ phone, onChange }: PhoneFieldProps) {
  return (
    <div className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
      <label htmlFor="phone" className="block text-xs font-medium text-gray-900 dark:text-gray-100">
        Phone Number
      </label>
      <input
        aria-label="Phone Number"
        required
        autoComplete="tel"
        aria-required
        name="phone"
        id="phone"
        value={phone}
        className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-100"
        placeholder="(555) 444 - 3333"
        onChange={onChange}
      />
    </div>
  )
}
