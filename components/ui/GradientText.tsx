import clsx from 'clsx'

const defaultGradientColors = 'from-slate-700 via-primary-700 to-primary-500'
const defaultGradientColorsDark = 'dark:from-white dark:via-white dark:to-primary-400'
const defaultGradientDirection = 'bg-gradient-to-b'
const defaultDirectionLevels = 'from-10% via-40% to-80%'
const defaultTextStyles = 'bg-clip-text text-transparent whitespace-nowrap'

/**
 * Validates that the gradient colors string includes both 'from-' and 'to-' classes.
 * If 'via-' is present, it must be followed by a valid class.
 *
 * @param {string} value - The gradient colors string to validate.
 * @param {string} name - The name of the variable being validated.
 * @throws {Error} If the validation fails.
 *
 * @example
 * validateGradientColors('from-blue-500 to-green-500', 'gradientColors'); // Passes
 * validateGradientColors('from-blue-500 via-red-500 to-green-500', 'gradientColors'); // Passes
 * validateGradientColors('from-blue-500', 'gradientColors'); // Fails
 * validateGradientColors('via-red-500 to-green-500', 'gradientColors'); // Fails
 */
function validateGradientColors(value: string, name: string) {
  if (!value.includes('from-') || !value.includes('to-')) {
    throw new Error(`${name} must include both 'from-' and 'to-' classes.`)
  }
  if (value.includes('via-') && !/via-[^\s]+/.test(value)) {
    throw new Error(`${name} contains an invalid 'via-' class.`)
  }
}

/**
 * Validates that the dark gradient colors string includes both 'dark:from-' and 'dark:to-' classes.
 * If 'dark:via-' is present, it must be followed by a valid class.
 *
 * @param {string} value - The dark gradient colors string to validate.
 * @param {string} name - The name of the variable being validated.
 * @throws {Error} If the validation fails.
 *
 * @example
 * validateDarkGradientColors('dark:from-blue-500 dark:to-green-500', 'gradientColorsDark'); // Passes
 * validateDarkGradientColors('dark:from-blue-500 dark:via-red-500 dark:to-green-500', 'gradientColorsDark'); // Passes
 * validateDarkGradientColors('dark:from-blue-500', 'gradientColorsDark'); // Fails
 * validateDarkGradientColors('dark:via-red-500 dark:to-green-500', 'gradientColorsDark'); // Fails
 */
function validateDarkGradientColors(value: string, name: string) {
  if (!value.includes('dark:from-') || !value.includes('dark:to-')) {
    throw new Error(`${name} must include both 'dark:from-' and 'dark:to-' classes.`)
  }
  if (value.includes('dark:via-') && !/dark:via-[^\s]+/.test(value)) {
    throw new Error(`${name} contains an invalid 'dark:via-' class.`)
  }
}

/**
 * Validates that all classes in the string are prefixed with 'dark:'.
 *
 * @param {string} value - The string containing space-separated classes to validate.
 * @param {string} name - The name of the variable being validated.
 * @throws {Error} If any class is not prefixed with 'dark:'.
 *
 * @example
 * validateAllDarkClasses('dark:from-blue-500 dark:to-green-500', 'gradientColorsDark'); // Passes
 * validateAllDarkClasses('dark:from-blue-500 to-green-500', 'gradientColorsDark'); // Fails
 */
function validateAllDarkClasses(value: string, name: string) {
  const classes = value.split(' ')
  for (const cls of classes) {
    if (!cls.startsWith('dark:')) {
      throw new Error(`${name} must have all classes prefixed with 'dark:'`)
    }
  }
}

/**
 * Validates that the gradient direction starts with 'bg-gradient-to-'.
 *
 * @param {string} value - The gradient direction string to validate.
 * @param {string} name - The name of the variable being validated.
 * @throws {Error} If the validation fails.
 *
 * @example
 * validateGradientDirection('bg-gradient-to-r', 'gradientDirection'); // Passes
 * validateGradientDirection('gradient-to-r', 'gradientDirection'); // Fails
 */
function validateGradientDirection(value: string, name: string) {
  if (!value.startsWith('bg-gradient-to-')) {
    throw new Error(`${name} must start with 'bg-gradient-to-'`)
  }
}

/**
 * Validates that the direction levels string contains valid levels like 'from-10%', 'via-40%', 'to-80%'.
 *
 * @param {string} value - The direction levels string to validate.
 * @param {string} name - The name of the variable being validated.
 * @throws {Error} If the validation fails.
 *
 * @example
 * validateDirectionLevels('from-10% via-40% to-80%', 'directionLevels'); // Passes
 * validateDirectionLevels('from-10 via-40% to-80%', 'directionLevels'); // Fails
 */
function validateDirectionLevels(value: string, name: string) {
  const levels = value.split(' ')
  for (const level of levels) {
    if (!/^(from|via|to)-\d+%$/.test(level)) {
      throw new Error(
        `${name} must have valid direction levels like 'from-10%', 'via-40%', 'to-80%'`
      )
    }
  }
}

export function GradientText({
  children,
  gradientColors = defaultGradientColors,
  gradientColorsDark = defaultGradientColorsDark,
  gradientDirection = defaultGradientDirection,
  directionLevels = defaultDirectionLevels,
}: {
  children: React.ReactNode
  classes?: string
  gradientColors?: string
  gradientColorsDark?: string
  gradientDirection?: string
  directionLevels?: string
}) {
  validateGradientColors(gradientColors, 'defaultGradientColors')
  validateDarkGradientColors(gradientColorsDark, 'defaultGradientColorsDark')
  validateAllDarkClasses(gradientColorsDark, 'defaultGradientColorsDark')
  validateGradientDirection(gradientDirection, 'defaultGradientDirection')
  validateDirectionLevels(directionLevels, 'defaultDirectionLevels')

  return (
    <span
      className={clsx(
        gradientColors,
        gradientColorsDark,
        gradientDirection,
        directionLevels,
        defaultTextStyles
      )}
    >
      {children}
    </span>
  )
}

export {
  validateGradientColors,
  validateDarkGradientColors,
  validateAllDarkClasses,
  validateGradientDirection,
  validateDirectionLevels,
}
