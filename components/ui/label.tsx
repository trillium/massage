/* ds-ignore-file */
import { cn } from '@/lib/cn'

type LabelStatus = 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'

type LabelProps = React.HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> & {
  as?: 'p' | 'span' | 'div'
  status?: LabelStatus
}

const statusClasses: Record<LabelStatus, string> = {
  default: 'text-accent-600 dark:text-accent-400',
  primary: 'text-primary-600 dark:text-primary-400',
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
}

export function LabelSm({ as: Tag = 'p', status = 'default', className, ...props }: LabelProps) {
  return (
    <Tag
      className={cn('text-xs font-medium tracking-wide', statusClasses[status], className)}
      {...props}
    />
  )
}
