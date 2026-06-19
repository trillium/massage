/* ds-ignore-file */
import { cn } from '@/lib/cn'
import type { InputHTMLAttributes } from 'react'

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export function Radio({ label, error, className, id, ...props }: RadioProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 text-sm text-accent-900 dark:text-accent-100"
      >
        <input
          id={id}
          type="radio"
          className={cn(
            'h-4 w-4 cursor-pointer rounded-full border border-accent-300 text-primary-600',
            'focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-accent-600 dark:bg-surface-700 dark:text-primary-500 dark:ring-offset-accent-900',
            className
          )}
          {...props}
        />
        {label && <span className="select-none">{label}</span>}
      </label>
      {error && <p className="pl-6 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
