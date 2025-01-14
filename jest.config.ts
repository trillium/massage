import { Config } from '@jest/types'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config.InitialOptions = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/data/(.*)$': '<rootDir>/data/$1',
    '^@/layouts/(.*)$': '<rootDir>/layouts/$1',
    '^@/css/(.*)$': '<rootDir>/css/$1',
    '^@/redux/(.*)$': '<rootDir>/redux/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^contentlayer/generated$': '<rootDir>/.contentlayer/generated',
  },
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
