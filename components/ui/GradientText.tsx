import clsx from 'clsx'

const defaultGradientColors = 'from-primary-700 via-primary-500 to-primary-400'
const defaultDarkGradientColors = 'dark:from-primary-100 dark:to-primary-400'
const defaultGradientDirection = 'bg-gradient-to-b'
const defaultTextStyles = 'bg-clip-text text-transparent'

function validateGradientColors(value: string, name: string) {
  if (!value.includes('from-') || !value.includes('to-')) {
    throw new Error(`${name} must include both 'from-' and 'to-' classes.`)
  }
  if (value.includes('via-') && !/via-[^\s]+/.test(value)) {
    throw new Error(`${name} contains an invalid 'via-' class.`)
  }
}

function validateDarkGradientColors(value: string, name: string) {
  if (!value.includes('dark:from-') || !value.includes('dark:to-')) {
    throw new Error(`${name} must include both 'dark:from-' and 'dark:to-' classes.`)
  }
  if (value.includes('dark:via-') && !/dark:via-[^\s]+/.test(value)) {
    throw new Error(`${name} contains an invalid 'dark:via-' class.`)
  }
}

function validateGradientDirection(value: string, name: string) {
  if (!value.startsWith('bg-gradient-to-')) {
    throw new Error(`${name} must start with 'bg-gradient-to-'`)
  }
}

validateGradientColors(defaultGradientColors, 'defaultGradientColors')
validateDarkGradientColors(defaultDarkGradientColors, 'defaultDarkGradientColors')
validateGradientDirection(defaultGradientDirection, 'defaultGradientDirection')

export function GradientText({
  children,
  classes,
  gradientColors = defaultGradientColors,
  darkGradientColors = defaultDarkGradientColors,
  gradientDirection = defaultGradientDirection,
}: {
  children: React.ReactNode
  classes?: string
  gradientColors?: string
  darkGradientColors?: string
  gradientDirection?: string
}) {
  validateGradientColors(gradientColors, 'defaultGradientColors')
  validateDarkGradientColors(darkGradientColors, 'defaultDarkGradientColors')
  validateGradientDirection(gradientDirection, 'defaultGradientDirection')

  return (
    <span
      className={clsx(
        gradientColors,
        darkGradientColors,
        gradientDirection,
        defaultTextStyles,
        classes
      )}
    >
      {children}
    </span>
  )
}
