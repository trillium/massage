/* ds-ignore-file */
import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type Level = 1 | 2 | 3 | 4
type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: Level
  size?: Size
}

const levelMap: Record<Level, 'h1' | 'h2' | 'h3' | 'h4'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
}

const sizeMap: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
}

export function Heading({ level = 2, size = 'xl', className, children, ...props }: HeadingProps) {
  const Tag = levelMap[level] as React.ElementType
  return (
    <Tag className={cn('font-bold', sizeMap[size], className)} {...props}>
      {children}
    </Tag>
  )
}
