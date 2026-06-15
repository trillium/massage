import React from 'react'
import { fieldClasses } from './classes'
import booking from '@/data/booking.json'

import { Textarea } from '@/components/ui/textarea'

const { notes: copy } = booking.form

type NotesFieldProps = {
  additionalNotes: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function NotesField({ additionalNotes, onChange }: NotesFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="additionalNotes" className={fieldClasses.label}>
        {copy.label}
      </label>
      <Textarea
        aria-label={copy.ariaLabel}
        id="additionalNotes"
        rows={3}
        value={additionalNotes}
        className={fieldClasses.input}
        placeholder={copy.placeholder}
        onChange={onChange}
      />
    </div>
  )
}
