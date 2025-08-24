import clsx from 'clsx'

export function GradientText({
  children,
  classes,
}: {
  children: React.ReactNode
  classes?: string
}) {
  return (
    <span
      className={clsx(
        'dark:from-primary-400 dark:to-primary-600 from-primary-700 to-primary-400 border-primary-900 bg-gradient-to-b bg-clip-text text-transparent',
        classes
      )}
    >
      {children}
    </span>
  )
}
