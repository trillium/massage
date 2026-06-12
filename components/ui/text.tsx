/* ds-ignore-file */
import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'base' | 'lg'
  muted?: boolean
}

const sizeMap: Record<NonNullable<TextProps['size']>, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
}

export function Text({
  as: Tag = 'p',
  size = 'base',
  muted,
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(sizeMap[size], muted && 'text-accent-500 dark:text-accent-400', className)}
      {...props}
    >
      {children}
    </Tag>
  )
}
