'use client'

import { fieldClasses } from './classes'
import { TextSmSemibold, TextXsMuted } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'

const DEFAULT_HINTS = {
  community: '15 min standard — longer available',
  team: '30 min standard — longer available',
}

type RoleFieldProps = {
  value: 'community' | 'team' | undefined
  onChange: (value: 'community' | 'team') => void
  hints?: { community: string; team: string }
}

export default function RoleField({ value, onChange, hints = DEFAULT_HINTS }: RoleFieldProps) {
  const ROLE_OPTIONS = [
    { value: 'community' as const, label: 'Community member', hint: hints.community },
    { value: 'team' as const, label: 'Volunteer / team member', hint: hints.team },
  ]
  return (
    <fieldset className="rounded-md border-2 border-primary-200 bg-primary-50 p-3 dark:border-primary-800 dark:bg-primary-950/30">
      <legend className={fieldClasses.label}>{'Your involvement at Edge'}</legend>
      <Stack direction="col" gap={2} className="mt-2">
        {ROLE_OPTIONS.map((option) => (
          <Stack key={option.value} direction="row" align="start" gap={3}>
            <Input
              type="radio"
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
