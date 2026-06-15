'use client'

import { toast } from 'sonner'
import { RAFFLE_INTEREST_LABELS } from '@/lib/schema'
import { TextSm, TextBase } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { Textarea } from '@/components/ui/textarea'
import { Code } from '@/components/ui/code'

export interface Entry {
  id: string
  name: string
  email: string
  phone: string
  zip_code: string | null
  interested_in: string[]
  is_winner: boolean
  sms_sent_at: string | null
}

export const VARS: Record<string, string> = {
  '{firstName}': 'First name',
  '{name}': 'Full name',
  '{email}': 'Email',
  '{phone}': 'Phone',
  '{expiration}': 'Expiration date',
}

export const DEFAULT_WINNER_TEMPLATE = `Hey {firstName}! 🎉 You won the raffle — a free 60-minute massage! Book here before {expiration}: https://trilliummassage.la/book`

export const DEFAULT_NON_WINNER_TEMPLATE = `Hey {firstName}! Unfortunately you didn't win this time, BUT I wanted to extend a free 30-minute upgrade to you, valid through {expiration}. Book here: https://trilliummassage.la/book`

function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`
  const suffixes = ['th', 'st', 'nd', 'rd']
  return `${n}${suffixes[n % 10] ?? 'th'}`
}

function formatExpiration(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const month = d.toLocaleDateString('en-US', { month: 'long' })
  return `${month} ${ordinal(d.getDate())}`
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function capitalizeName(name: string) {
  return name.split(' ').map(capitalize).join(' ')
}

export function resolveTemplate(template: string, entry: Entry, expiration: string | null) {
  const expirationStr = expiration ? formatExpiration(expiration) : 'TBD'
  return template
    .replace(/\{firstName\}/g, capitalize(entry.name.split(' ')[0]))
    .replace(/\{name\}/g, capitalizeName(entry.name))
    .replace(/\{email\}/g, entry.email)
    .replace(/\{phone\}/g, entry.phone)
    .replace(/\{expiration\}/g, expirationStr)
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied`)
}

export function CopyButton({
  text,
  label,
  children,
}: {
  text: string
  label: string
  children: string
}) {
  return (
    <Button type="button" size="sm" onClick={() => copyToClipboard(text, label)}>
      {children}
    </Button>
  )
}

export function EntryDetails({ entry }: { entry: Entry }) {
  return (
    <Stack gap={1} className="text-sm">
      <TextSm className="font-semibold">{entry.name}</TextSm>
      <TextSm status="muted">{entry.email}</TextSm>
      <TextSm status="muted">{entry.phone}</TextSm>
      {entry.zip_code && <TextSm status="muted">{`Zip: ${entry.zip_code}`}</TextSm>}
      {Array.isArray(entry.interested_in) && entry.interested_in.length > 0 && (
        <TextSm status="muted">
          {entry.interested_in.map((i) => RAFFLE_INTEREST_LABELS[i] || i).join(', ')}
        </TextSm>
      )}
    </Stack>
  )
}

export function TemplateEditor({
  label,
  template,
  onChange,
}: {
  label: string
  template: string
  onChange: (value: string) => void
}) {
  return (
    <Textarea
      label={label}
      value={template}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      style={{ fieldSizing: 'content' } as React.CSSProperties}
    />
  )
}

export function EditableMessage({
  message,
  label,
  onChange,
}: {
  message: string
  label: string
  onChange: (value: string) => void
}) {
  return (
    <Stack
      direction="row"
      align="start"
      gap={3}
      className="rounded border border-accent-200 bg-surface-100 p-3 dark:border-accent-700 dark:bg-surface-900"
    >
      <Box className="flex-1">
        <Textarea
          value={message}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
          className="resize-none border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
        />
      </Box>
      <CopyButton text={message} label={label}>
        {'Copy Message'}
      </CopyButton>
    </Stack>
  )
}

export function TemplateVarsPanel() {
  return (
    <Box className="rounded-lg border border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800">
      <TextBase className="mb-3 font-semibold">{'Template Variables'}</TextBase>
      <Stack direction="row" wrap className="gap-2">
        {Object.entries(VARS).map(([key, desc]) => (
          <Button
            type="button"
            key={key}
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(key, key)}
          >
            <Code className="font-semibold text-primary-600 dark:text-primary-400">{key}</Code>
            <TextSm as="span" status="muted" className="ml-1.5">
              {desc}
            </TextSm>
          </Button>
        ))}
      </Stack>
    </Box>
  )
}
