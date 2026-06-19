/* ds-ignore-file */
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Gap = 1 | 2 | 3 | 4 | 6 | 8
type Align = 'start' | 'center' | 'end' | 'stretch'
type Justify = 'start' | 'center' | 'end' | 'between'

type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: 'row' | 'col'
  gap?: Gap
  align?: Align
  justify?: Justify
  wrap?: boolean
}

const gapMap: Record<Gap, string> = {
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
}

const alignMap: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyMap: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = 'col', gap = 4, align, justify, wrap, className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        direction === 'col' ? 'flex-col' : 'flex-row',
        gap && gapMap[gap],
        align && alignMap[align],
        justify && justifyMap[justify],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
