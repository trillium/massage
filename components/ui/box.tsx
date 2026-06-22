/* ds-ignore-file */
import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type Variant = 'card' | 'card-warning' | 'card-sm' | 'accentCard'

const variantClasses: Record<Variant, string> = {
  card: 'rounded-lg border border-accent-200 bg-surface-50 p-6 dark:border-accent-700 dark:bg-surface-800',
  'card-sm':
    'rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-800',
  'card-warning':
    'rounded-lg border border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/20',
  accentCard: 'border-l-primary-400 dark:bg-primary-50/10 rounded-md border-l-4 bg-surface-50 p-3',
}

type BoxProps = HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav' | 'header' | 'footer'
  variant?: Variant
}

export function Box({ as: Tag = 'div', variant, className, children, ...props }: BoxProps) {
  return (
    <Tag className={cn(variant ? variantClasses[variant] : undefined, className)} {...props}>
      {children}
    </Tag>
  )
}
