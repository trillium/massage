/* ds-ignore-file */
import { cn } from '@/lib/cn'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-accent-700 dark:text-accent-300">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'h-10 w-full rounded-md border border-accent-300 bg-surface-50 px-3 py-2 text-sm',
          'text-accent-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-accent-600 dark:bg-surface-800 dark:text-accent-100',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
