/* ds-ignore-file */
import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type CodeProps = HTMLAttributes<HTMLElement> & {
  block?: boolean
}

export function Code({ block, className, children, ...props }: CodeProps) {
  if (block) {
    return (
      <pre
        className={cn(
          'rounded bg-surface-100 p-4 font-mono text-sm dark:bg-surface-800',
          className
        )}
        {...props}
      >
        <code>{children}</code>
      </pre>
    )
  }
  return (
    <code
      className={cn(
        'rounded bg-surface-100 px-1 py-0.5 font-mono text-sm dark:bg-surface-800',
        className
      )}
      {...props}
    >
      {children}
    </code>
  )
}
