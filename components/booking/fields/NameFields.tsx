import React from 'react'

type NameFieldsProps = {
  firstName: string
  lastName: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function NameFields({ firstName, lastName, onChange }: NameFieldsProps) {
  return (
    <div className="row focus-within:ring-primary-400 relative flex px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
      <div className="mx-1 w-full">
        <label
          htmlFor="firstName"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          First Name
        </label>
        <input
          aria-label="Name"
          type="text"
          autoCapitalize="words"
          autoComplete="given-name"
          required
          aria-required
          name="firstName"
          id="firstName"
          value={firstName}
          placeholder="First"
          onChange={onChange}
          className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-gray-100"
        />
      </div>
      <div className="mx-1 w-full">
        <label
          htmlFor="lastName"
          className="block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Last Name
        </label>
        <input
          aria-label="Name"
          type="text"
          autoCapitalize="words"
          autoComplete="family-name"
          required
          aria-required
          name="lastName"
          id="lastName"
          value={lastName}
          placeholder="Last"
          onChange={onChange}
          className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-gray-100"
        />
      </div>
    </div>
  )
}
