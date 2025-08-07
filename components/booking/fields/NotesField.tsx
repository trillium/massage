import React from 'react'
import { fieldClasses } from './classes'

type NotesFieldProps = {
  additionalNotes: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function NotesField({ additionalNotes, onChange }: NotesFieldProps) {
  return (
    <div className={fieldClasses.row}>
      <label htmlFor="additionalNotes" className={fieldClasses.label}>
        Additional Notes
      </label>
      <textarea
        aria-label="Additional Notes"
        name="additionalNotes"
        id="additionalNotes"
        rows={3}
        value={additionalNotes}
        className={fieldClasses.input}
        placeholder="Any special requests, accessibility needs, or additional information"
        onChange={onChange}
      />
    </div>
  )
}
