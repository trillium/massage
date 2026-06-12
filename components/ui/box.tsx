/* ds-ignore-file */
import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type BoxProps = HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav' | 'header' | 'footer'
}

export function Box({ as: Tag = 'div', className, children, ...props }: BoxProps) {
  return (
    <Tag className={cn(className)} {...props}>
      {children}
    </Tag>
  )
}
