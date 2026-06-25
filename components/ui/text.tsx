/* ds-ignore-file */
import { cn } from '@/lib/cn'

export type TextStatus =
  | 'default'
  | 'muted'
  | 'secondary'
  | 'subtle'
  | 'surface'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'primary'

type TextProps = React.HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> & {
  status?: TextStatus
  as?: 'p' | 'span' | 'div'
}

const statusClasses: Record<TextStatus, string> = {
  default: 'text-accent-900 dark:text-accent-100',
  muted: 'text-accent-500 dark:text-accent-400',
  secondary: 'text-accent-600 dark:text-accent-400',
  subtle: 'text-accent-700 dark:text-accent-300',
  surface: 'text-surface-600 dark:text-surface-400',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
  primary: 'text-primary-600 dark:text-primary-400',
}

function makeText(baseClasses: string, defaultStatus: TextStatus = 'default') {
  return function TextVariant({
    status = defaultStatus,
    as: Tag = 'p',
    className,
    ...props
  }: TextProps) {
    return <Tag className={cn(baseClasses, statusClasses[status], className)} {...props} />
  }
}

export const TextBase = makeText('text-base')
export const TextBaseMuted = makeText('text-base', 'muted')
export const TextBaseMedium = makeText('text-base font-medium')
export const TextSm = makeText('text-sm')
export const TextSmMuted = makeText('text-sm', 'muted')
export const TextSmMedium = makeText('text-sm font-medium')
export const TextSmSemibold = makeText('text-sm font-semibold')
export const TextBaseSemibold = makeText('text-base font-semibold')
export const TextXs = makeText('text-xs')
export const TextXsMuted = makeText('text-xs', 'muted')
export const TextXsMedium = makeText('text-xs font-medium')
export const TextLg = makeText('text-lg')
export const TextLgMuted = makeText('text-lg', 'muted')
export const TextLgSemibold = makeText('text-lg font-semibold')
export const TextMuted = makeText('text-base', 'muted')
export const TextPrimary = makeText('text-sm', 'primary')
export const TextSmMono = makeText('text-sm font-mono')

type CaptionProps = React.HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> & {
  as?: 'p' | 'span' | 'div'
}

export function Caption({ as: Tag = 'p', className, ...props }: CaptionProps) {
  return (
    <Tag className={cn('text-xs text-surface-500 dark:text-surface-400', className)} {...props} />
  )
}
