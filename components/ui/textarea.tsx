import { cn } from '@/lib/cn'
import type { TextareaHTMLAttributes } from 'react'

import { TextXs } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <Stack direction="col" gap={1}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-accent-700 dark:text-accent-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'min-h-[80px] w-full rounded-md border border-accent-300 bg-surface-50 px-3 py-2 text-sm',
          'text-accent-900 placeholder:text-accent-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-accent-600 dark:bg-surface-800 dark:text-accent-100 dark:placeholder:text-accent-500',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <TextXs className="text-xs text-red-600 dark:text-red-400">{error}</TextXs>}
    </Stack>
  )
}
