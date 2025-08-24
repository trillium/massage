import { describe, it, expect } from 'vitest'
import {
  validateGradientColors,
  validateDarkGradientColors,
  validateAllDarkClasses,
  validateGradientDirection,
  validateDirectionLevels,
} from './GradientText'

describe('Validation Functions', () => {
  it('validateGradientColors passes for valid input', () => {
    expect(() =>
      validateGradientColors('from-blue-500 to-green-500', 'gradientColors')
    ).not.toThrow()
    expect(() =>
      validateGradientColors('from-blue-500 via-red-500 to-green-500', 'gradientColors')
    ).not.toThrow()
  })

  it('validateGradientColors fails for invalid input', () => {
    expect(() => validateGradientColors('from-blue-500', 'gradientColors')).toThrow()
    expect(() => validateGradientColors('via-red-500 to-green-500', 'gradientColors')).toThrow()
  })

  it('validateDarkGradientColors passes for valid input', () => {
    expect(() =>
      validateDarkGradientColors('dark:from-blue-500 dark:to-green-500', 'gradientColorsDark')
    ).not.toThrow()
    expect(() =>
      validateDarkGradientColors(
        'dark:from-blue-500 dark:via-red-500 dark:to-green-500',
        'gradientColorsDark'
      )
    ).not.toThrow()
  })

  it('validateDarkGradientColors fails for invalid input', () => {
    expect(() => validateDarkGradientColors('dark:from-blue-500', 'gradientColorsDark')).toThrow()
    expect(() =>
      validateDarkGradientColors('dark:via-red-500 dark:to-green-500', 'gradientColorsDark')
    ).toThrow()
  })

  it('validateAllDarkClasses passes for valid input', () => {
    expect(() =>
      validateAllDarkClasses('dark:from-blue-500 dark:to-green-500', 'gradientColorsDark')
    ).not.toThrow()
  })

  it('validateAllDarkClasses fails for invalid input', () => {
    expect(() =>
      validateAllDarkClasses('dark:from-blue-500 to-green-500', 'gradientColorsDark')
    ).toThrow()
  })

  it('validateGradientDirection passes for valid input', () => {
    expect(() => validateGradientDirection('bg-gradient-to-r', 'gradientDirection')).not.toThrow()
  })

  it('validateGradientDirection fails for invalid input', () => {
    expect(() => validateGradientDirection('gradient-to-r', 'gradientDirection')).toThrow()
  })

  it('validateDirectionLevels passes for valid input', () => {
    expect(() =>
      validateDirectionLevels('from-10% via-40% to-80%', 'directionLevels')
    ).not.toThrow()
  })

  it('validateDirectionLevels fails for invalid input', () => {
    expect(() => validateDirectionLevels('from-10 via-40% to-80%', 'directionLevels')).toThrow()
  })
})
