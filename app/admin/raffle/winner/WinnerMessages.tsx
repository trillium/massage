'use client'

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
}

function firstName(name: string) {
  return name.split(' ')[0]
}

function winnerSms(name: string) {
  return `Hey ${firstName(name)}! 🎉 You won the OpenClaw raffle — a free 60-minute massage! Book here before May 23: https://trilliummassage.la/openclaw-raffle-prize`
}

function nonWinnerSms(name: string) {
  return `Hey ${firstName(name)}! Unfortunately you didn't win the raffle, BUT! I wanted to extend a free 30-minute upgrade to you, valid through May 23. Book here: https://trilliummassage.la/openclaw-appreciation`
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

function MessageTemplate({ message, label }: { message: string; label: string }) {
  return (
    <div className="flex items-start gap-3 rounded border border-accent-200 bg-surface-100 p-3 dark:border-accent-700 dark:bg-surface-900">
      <p className="flex-1 text-sm text-accent-800 dark:text-accent-200">{message}</p>
      <CopyButton text={message} label={label} />
    </div>
  )
}

export function WinnerMessages({ winner, nonWinners }: WinnerMessagesProps) {
  const cardClass =
    'rounded-lg border border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800'

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/20">
        <h2 className="mb-4 text-lg font-semibold text-yellow-900 dark:text-yellow-100">Winner</h2>
        <EntryDetails entry={winner} />
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Winner SMS
          </h3>
          <MessageTemplate message={winnerSms(winner.name)} label="Winner SMS" />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-lg font-semibold text-accent-900 dark:text-accent-100">
          Non-Winners ({nonWinners.length})
        </h2>
        <div className="mt-2">
          <h3 className="mb-3 text-sm font-medium text-accent-600 dark:text-accent-400">
            Non-Winner SMS Template
          </h3>
          <div className="space-y-4">
            {nonWinners.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-accent-100 p-4 dark:border-accent-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-accent-900 dark:text-accent-100">
                    {entry.name}
                  </span>
                  <span className="text-xs text-accent-500 dark:text-accent-400">
                    {entry.phone}
                  </span>
                </div>
                <MessageTemplate
                  message={nonWinnerSms(entry.name)}
                  label={`SMS for ${firstName(entry.name)}`}
                />
              </div>
            ))}
            {nonWinners.length === 0 && (
              <p className="text-sm text-accent-400">No non-winner entries</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
