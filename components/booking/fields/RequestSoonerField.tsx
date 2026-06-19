'use client'

import { TextSmSemibold, TextXsMuted } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

type RequestSoonerFieldProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function RequestSoonerField({ checked, onChange }: RequestSoonerFieldProps) {
  return (
    <Box className="rounded-md border-2 border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
      <Stack direction="row" align="start" gap={3}>
        <Input
          type="checkbox"
          id="requestSooner"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-accent-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="requestSooner" className="cursor-pointer">
          <TextSmSemibold className="block">
            I'd like an earlier slot if one opens up
          </TextSmSemibold>
          <TextXsMuted className="block">
            Trillium will reach out if an earlier time becomes available
          </TextXsMuted>
        </label>
      </Stack>
    </Box>
  )
}
