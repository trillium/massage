'use client'

import { toast } from 'sonner'
import { RAFFLE_INTEREST_LABELS } from '@/lib/schema'
import {
  TextSm,
  TextSmMedium,
  TextSmSemibold,
  TextBaseMedium,
  TextXsMuted,
  TextXs,
} from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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

export interface SlugOption {
  slug: string
  title: string
  durationBonus: number | null
}

export interface RaffleVars {
  upgradeMinutes: number
  bookingLink: string
  expiration: string | null
}

export const ENTRY_VARS: Record<string, string> = {
  '{firstName}': 'First name',
  '{name}': 'Full name',
  '{email}': 'Email',
  '{phone}': 'Phone',
  '{expiration}': 'Expiration date',
  '{upgradeMinutes}': 'Upgrade minutes',
  '{bookingLink}': 'Booking link',
}

export const DEFAULT_WINNER_TEMPLATE = `Hey {firstName}! 🎉 You won the raffle — a free 60-minute massage! Book here before {expiration}: {bookingLink}`

export const DEFAULT_NON_WINNER_TEMPLATE = `Hey {firstName}! Unfortunately you didn't win this time, BUT I wanted to extend a free {upgradeMinutes}-minute upgrade to you, valid through {expiration}. Book here: {bookingLink}`

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

export type VarOverrides = Record<string, string>

function defaultResolveVar(varName: string, entry: Entry, raffleVars: RaffleVars): string {
  const firstName = entry.name.split(' ')[0]
  switch (varName) {
    case '{firstName}':
      return capitalize(firstName)
    case '{name}':
      return capitalizeName(entry.name)
    case '{email}':
      return entry.email
    case '{phone}':
      return entry.phone
    case '{expiration}':
      return raffleVars.expiration ? formatExpiration(raffleVars.expiration) : 'TBD'
    case '{upgradeMinutes}':
      return String(raffleVars.upgradeMinutes)
    case '{bookingLink}':
      return raffleVars.bookingLink
    default:
      return varName
  }
}

function resolveVar(
  varName: string,
  entry: Entry,
  raffleVars: RaffleVars,
  overrides?: VarOverrides
): string {
  return overrides?.[varName] !== undefined
    ? overrides[varName]
    : defaultResolveVar(varName, entry, raffleVars)
}

export function getTemplateVars(template: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const m of template.matchAll(/\{(\w+)\}/g)) {
    const v = `{${m[1]}}`
    if (!seen.has(v)) {
      seen.add(v)
      result.push(v)
    }
  }
  return result
}

export function getVarVariants(varName: string, entry: Entry): { label: string; value: string }[] {
  if (varName === '{firstName}') {
    const raw = entry.name.split(' ')[0]
    const seen = new Set<string>()
    return [
      { label: capitalize(raw), value: capitalize(raw) },
      { label: raw, value: raw },
      { label: raw.toUpperCase(), value: raw.toUpperCase() },
    ].filter((v) => {
      if (seen.has(v.value)) return false
      seen.add(v.value)
      return true
    })
  }
  if (varName === '{name}') {
    const titled = capitalizeName(entry.name)
    if (titled === entry.name) return []
    return [
      { label: titled, value: titled },
      { label: entry.name, value: entry.name },
    ]
  }
  return []
}

export function resolveTemplate(
  template: string,
  entry: Entry,
  raffleVars: RaffleVars,
  varOverrides?: VarOverrides
) {
  return template.replace(/\{(\w+)\}/g, (match) =>
    resolveVar(match, entry, raffleVars, varOverrides)
  )
}

export function EntryVarPanel({
  template,
  entry,
  raffleVars,
  varOverrides,
  onVarOverride,
}: {
  template: string
  entry: Entry
  raffleVars: RaffleVars
  varOverrides: VarOverrides
  onVarOverride: (varName: string, value: string) => void
}) {
  const vars = getTemplateVars(template)
  return (
    <Stack direction="row" wrap gap={2} className="mt-1">
      {vars.map((varName) => {
        const current = resolveVar(varName, entry, raffleVars, varOverrides)
        const variants = getVarVariants(varName, entry)
        return (
          <Stack key={varName} direction="row" align="center" gap={1}>
            <TextXsMuted>{`${varName}:`}</TextXsMuted>
            {variants.length > 1 ? (
              variants.map((v) => (
                <Button
                  key={v.value}
                  type="button"
                  size="sm"
                  variant={v.value === current ? 'default' : 'outline'}
                  onClick={() => onVarOverride(varName, v.value)}
                >
                  {v.label}
                </Button>
              ))
            ) : (
              <TextXs status="muted" className="max-w-32 truncate">
                {current}
              </TextXs>
            )}
          </Stack>
        )
      })}
    </Stack>
  )
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
    <Stack gap={1}>
      <TextSmSemibold>{entry.name}</TextSmSemibold>
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

export function TemplateVarsPanel({
  upgradeMinutes,
  bookingLink,
  slugOptions,
  onUpgradeMinutesChange,
  onBookingLinkChange,
}: {
  upgradeMinutes: number
  bookingLink: string
  slugOptions: SlugOption[]
  onUpgradeMinutesChange: (v: number) => void
  onBookingLinkChange: (v: string) => void
}) {
  function handleSlugSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const slug = e.target.value
    const match = slugOptions.find((o) => o.slug === slug)
    if (!match) return
    if (match.durationBonus != null) onUpgradeMinutesChange(match.durationBonus)
    onBookingLinkChange(`https://trilliummassage.la/${slug}`)
  }
  return (
    <Box variant="card">
      <TextBaseMedium className="mb-4">{'Template Variables'}</TextBaseMedium>

      <Stack gap={4}>
        <Box>
          <TextSmMedium className="mb-2 block">{'Insert (click to copy)'}</TextSmMedium>
          <Stack direction="row" wrap className="gap-2">
            {Object.entries(ENTRY_VARS).map(([key, desc]) => (
              <Button
                type="button"
                key={key}
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(key, key)}
              >
                <Code // ds-ignore - Code has no color variant; primary color is intentional for var tokens
                  className="font-semibold text-primary-600 dark:text-primary-400"
                >
                  {key}
                </Code>
                <TextSm as="span" status="muted" className="ml-1.5">
                  {desc}
                </TextSm>
              </Button>
            ))}
          </Stack>
        </Box>

        <Box>
          <TextSmMedium className="mb-2 block">{'Raffle values'}</TextSmMedium>
          <Stack gap={3}>
            <Box>
              <Input
                label="Match slug (auto-fills minutes + link)"
                list="slug-options"
                placeholder="e.g. overtime-appreciation"
                onChange={handleSlugSelect}
              />
              <datalist id="slug-options">
                {slugOptions.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>
                    {opt.durationBonus != null
                      ? `${opt.title} (+${opt.durationBonus} min)`
                      : opt.title}
                  </option>
                ))}
              </datalist>
            </Box>
            <Stack direction="row" gap={3} align="end">
              <Box className="w-32">
                <Input
                  label="Upgrade minutes"
                  type="number"
                  min={1}
                  value={upgradeMinutes}
                  onChange={(e) => onUpgradeMinutesChange(Number(e.target.value))}
                />
              </Box>
              <Box className="flex-1">
                <Input
                  label="Booking link"
                  type="url"
                  value={bookingLink}
                  onChange={(e) => onBookingLinkChange(e.target.value)}
                  placeholder="https://trilliummassage.la/..."
                />
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
