/* ds-ignore-file */
import { cn } from '@/lib/cn'

type HeadingStatus = 'default' | 'primary' | 'muted' | 'error' | 'success' | 'warning' | 'info'

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  status?: HeadingStatus
}

const statusClasses: Record<HeadingStatus, string> = {
  default: 'text-accent-900 dark:text-accent-100',
  muted: 'text-accent-500 dark:text-accent-400',
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
  primary: 'text-primary-600 dark:text-primary-400',
}

export function H1({ status = 'default', className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn('text-3xl font-bold tracking-tight', statusClasses[status], className)}
      {...props}
    />
  )
}

export function H1Hero({ status = 'default', className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn('text-4xl font-extrabold tracking-tight', statusClasses[status], className)}
      {...props}
    />
  )
}

export function H2({ status = 'default', className, ...props }: HeadingProps) {
  return <h2 className={cn('text-2xl font-bold', statusClasses[status], className)} {...props} />
}

export function H3({ status = 'default', className, ...props }: HeadingProps) {
  return <h3 className={cn('text-lg font-semibold', statusClasses[status], className)} {...props} />
}

export function H4({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn('text-base font-medium text-accent-700 dark:text-accent-300', className)}
      {...props}
    />
  )
}
