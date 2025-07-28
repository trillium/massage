import React from 'react'

type NotesFieldProps = {
  additionalNotes: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function NotesField({ additionalNotes, onChange }: NotesFieldProps) {
  return (
    <div className="relative px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400">
      <label
        htmlFor="additionalNotes"
        className="block text-xs font-medium text-gray-900 dark:text-gray-100"
      >
        Additional Notes
      </label>
      <textarea
        aria-label="Additional Notes"
        name="additionalNotes"
        id="additionalNotes"
        rows={3}
        value={additionalNotes}
        className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-sm sm:leading-6"
        placeholder="Any special requests, accessibility needs, or additional information..."
        onChange={onChange}
      />
    </div>
  )
}
