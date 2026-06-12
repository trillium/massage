import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type Variant = 'default' | 'secondary' | 'outline' | 'destructive'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
  secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
  outline: 'border border-accent-300 text-accent-700 dark:border-accent-600 dark:text-accent-300',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
