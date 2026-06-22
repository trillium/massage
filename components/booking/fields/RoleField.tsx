'use client'

import { fieldClasses } from './classes'
import { TextSmSemibold, TextXsMuted } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { PeerRadio } from '@/components/ui/peer-radio'

type EdgeRole = 'attendee' | 'volunteer' | 'team'

const DEFAULT_HINTS: Record<EdgeRole, string> = {
  attendee: 'Spoiled',
  volunteer: 'Medium Spoiled',
  team: 'Maximum Spoiled',
}

type RoleFieldProps = {
  value: EdgeRole | undefined
  onChange: (value: EdgeRole) => void
  hints?: Partial<Record<EdgeRole, string>>
}

export default function RoleField({ value, onChange, hints }: RoleFieldProps) {
  const mergedHints = { ...DEFAULT_HINTS, ...hints }
  const ROLE_OPTIONS = [
    { value: 'attendee' as const, label: 'Attendee', hint: mergedHints.attendee },
    { value: 'volunteer' as const, label: 'Volunteer', hint: mergedHints.volunteer },
    { value: 'team' as const, label: 'Team member', hint: mergedHints.team },
  ]
  return (
    <fieldset className="rounded-md border-2 border-primary-200 bg-primary-50 p-3 dark:border-primary-800 dark:bg-primary-950/30">
      <legend className={fieldClasses.label}>{'Your involvement at Edge'}</legend>
      <Stack direction="col" gap={2} className="mt-2">
        {ROLE_OPTIONS.map((option) => (
          <Stack key={option.value} direction="row" align="start" gap={3}>
            <PeerRadio
              id={`role-${option.value}`}
              name="edgeMemberType"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-0.5 h-4 w-4 border-accent-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`role-${option.value}`} className="cursor-pointer">
              <TextSmSemibold className="block">{option.label}</TextSmSemibold>
              <TextXsMuted className="block">{option.hint}</TextXsMuted>
            </label>
          </Stack>
        ))}
      </Stack>
    </fieldset>
  )
}
