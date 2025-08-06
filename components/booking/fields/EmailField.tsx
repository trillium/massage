import React from 'react'

type EmailFieldProps = {
  email: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function EmailField({ email, onChange }: EmailFieldProps) {
  return (
    <div className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
      <label htmlFor="email" className="block text-xs font-medium text-gray-900 dark:text-gray-100">
        Email Address
      </label>
      <input
        aria-label="Email"
        required
        autoComplete="email"
        aria-required
        type="email"
        name="email"
        id="email"
        value={email}
        className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-100"
        placeholder="name@example.com"
        onChange={onChange}
      />
    </div>
  )
}
