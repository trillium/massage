'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { RAFFLE_INTEREST_LABELS } from '@/lib/schema'

interface Entry {
  id: string
  name: string
  email: string
  phone: string
  zip_code: string | null
  interested_in: string[]
  is_winner: boolean
}

interface WinnerMessagesProps {
  winner: Entry
  nonWinners: Entry[]
  expirationDate: string
}

const VARS: Record<string, string> = {
  '{firstName}': 'First name',
  '{name}': 'Full name',
  '{email}': 'Email',
  '{phone}': 'Phone',
  '{expiration}': 'Expiration date',
}

const DEFAULT_WINNER_TEMPLATE = `Hey {firstName}! 🎉 You won the OpenClaw raffle — a free 60-minute massage! Book here before {expiration}: https://trilliummassage.la/openclaw-raffle-prize`

const DEFAULT_NON_WINNER_TEMPLATE = `Hey {firstName}! Unfortunately you didn't win the raffle, BUT! I wanted to extend a free 30-minute upgrade to you, valid through {expiration}. Book here: https://trilliummassage.la/openclaw-appreciation`

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function capitalizeName(name: string) {
  return name.split(' ').map(capitalize).join(' ')
}

function resolveTemplate(template: string, entry: Entry, expiration: string) {
  return template
    .replace(/\{firstName\}/g, capitalize(entry.name.split(' ')[0]))
    .replace(/\{name\}/g, capitalizeName(entry.name))
    .replace(/\{email\}/g, entry.email)
    .replace(/\{phone\}/g, entry.phone)
    .replace(/\{expiration\}/g, expiration)
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied`)
}

function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <button
      onClick={() => copyToClipboard(text, label)}
      className="shrink-0 rounded bg-primary-500 px-3 py-1.5 text-sm text-white hover:bg-primary-600"
    >
      Copy
    </button>
  )
}

function EntryDetails({ entry }: { entry: Entry }) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold text-accent-900 dark:text-accent-100">{entry.name}</p>
      <p className="text-accent-600 dark:text-accent-400">{entry.email}</p>
      <p className="text-accent-600 dark:text-accent-400">{entry.phone}</p>
      {entry.zip_code && (
        <p className="text-accent-600 dark:text-accent-400">Zip: {entry.zip_code}</p>
      )}
      {Array.isArray(entry.interested_in) && entry.interested_in.length > 0 && (
        <p className="text-accent-600 dark:text-accent-400">
          {entry.interested_in.map((i) => RAFFLE_INTEREST_LABELS[i] || i).join(', ')}
        </p>
      )}
    </div>
  )
}

function TemplateEditor({
  label,
  template,
  onChange,
}: {
  label: string
  template: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium text-accent-700 dark:text-accent-300">{label}</label>
        <span className="text-xs text-accent-400">
          Variables: {Object.keys(VARS).join(' ')}
        </span>
      </div>
      <textarea
        value={template}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded border border-accent-300 bg-white px-3 py-2 text-sm text-accent-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-accent-600 dark:bg-surface-700 dark:text-accent-100"
      />
    </div>
  )
}

function ResolvedMessage({ message, label }: { message: string; label: string }) {
  return (
    <div className="flex items-start gap-3 rounded border border-accent-200 bg-surface-100 p-3 dark:border-accent-700 dark:bg-surface-900">
      <p className="flex-1 text-sm text-accent-800 dark:text-accent-200">{message}</p>
      <CopyButton text={message} label={label} />
    </div>
  )
}

export function WinnerMessages({ winner, nonWinners, expirationDate }: WinnerMessagesProps) {
  const [winnerTemplate, setWinnerTemplate] = useState(DEFAULT_WINNER_TEMPLATE)
  const [nonWinnerTemplate, setNonWinnerTemplate] = useState(DEFAULT_NON_WINNER_TEMPLATE)

  const cardClass =
    'rounded-lg border border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800'

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/20">
        <h2 className="mb-4 text-lg font-semibold text-yellow-900 dark:text-yellow-100">Winner</h2>
        <EntryDetails entry={winner} />
        <div className="mt-4 space-y-3">
          <TemplateEditor
            label="Winner SMS Template"
            template={winnerTemplate}
            onChange={setWinnerTemplate}
          />
          <ResolvedMessage
            message={resolveTemplate(winnerTemplate, winner, expirationDate)}
            label="Winner SMS"
          />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-lg font-semibold text-accent-900 dark:text-accent-100">
          Non-Winners ({nonWinners.length})
        </h2>
        <TemplateEditor
          label="Non-Winner SMS Template"
          template={nonWinnerTemplate}
          onChange={setNonWinnerTemplate}
        />
        <div className="mt-4 space-y-4">
          {nonWinners.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-accent-100 p-4 dark:border-accent-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-accent-900 dark:text-accent-100">
                  {capitalizeName(entry.name)}
                </span>
                <button
                  onClick={() => copyToClipboard(entry.phone, 'Phone')}
                  className="text-xs text-accent-500 hover:text-primary-500 dark:text-accent-400 dark:hover:text-primary-400"
                >
                  {entry.phone} 📋
                </button>
              </div>
              <ResolvedMessage
                message={resolveTemplate(nonWinnerTemplate, entry, expirationDate)}
                label={`SMS for ${entry.name.split(' ')[0]}`}
              />
            </div>
          ))}
          {nonWinners.length === 0 && (
            <p className="text-sm text-accent-400">No non-winner entries</p>
          )}
        </div>
      </div>
    </div>
  )
}
