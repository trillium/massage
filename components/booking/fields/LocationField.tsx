import React from 'react'
import clsx from 'clsx'
import { LocationObject } from 'lib/types'

type LocationFieldProps = {
  location: LocationObject
  readOnly: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function LocationField({ location, readOnly, onChange }: LocationFieldProps) {
  return (
    <div className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
      <label
        htmlFor="location"
        className="block text-xs font-medium text-gray-900 dark:text-gray-100"
      >
        Street
      </label>
      <input
        aria-label="street address"
        required
        autoComplete="street-address"
        aria-required
        name="location"
        id="location"
        value={location.street}
        readOnly={readOnly}
        className={clsx(
          'mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-100',
          { 'bg-gray-400 select-none dark:bg-gray-700': readOnly }
        )}
        placeholder="123 Address Road, Beverly Hills, CA 90210"
        onChange={onChange}
      />
      <div className="mt-2 flex space-x-2">
        <div className="w-1/2">
          <label
            htmlFor="city"
            className="block text-xs font-medium text-gray-900 dark:text-gray-100"
          >
            City
          </label>
          <input
            aria-label="city"
            required
            autoComplete="address-level2"
            aria-required
            name="city"
            id="city"
            value={location.city}
            readOnly={readOnly}
            className={clsx(
              'mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-100',
              { 'bg-gray-400 select-none dark:bg-gray-700': readOnly }
            )}
            placeholder="Los Angeles"
            onChange={onChange}
          />
        </div>
        <div className="w-1/2">
          <label
            htmlFor="zipCode"
            className="block text-xs font-medium text-gray-900 dark:text-gray-100"
          >
            Zip Code
          </label>
          <input
            aria-label="zip code"
            required
            autoComplete="postal-code"
            aria-required
            name="zipCode"
            id="zipCode"
            value={location.zip}
            readOnly={readOnly}
            className={clsx(
              'mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-100',
              { 'bg-gray-400 select-none dark:bg-gray-700': readOnly }
            )}
            placeholder="90210"
            pattern="\d{5}(-\d{4})?"
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  )
}
