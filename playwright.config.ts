import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 15000,
  use: {
    baseURL: 'http://localhost:9999',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    actionTimeout: 3000,
    navigationTimeout: 5000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'admin',
      testMatch: /tests\/e2e\/admin\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'user',
      testMatch: /tests\/e2e\/user\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'public',
      testMatch: /tests\/e2e\/(public|booking)\/.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
    },
  ],

  webServer: {
    command: 'pnpm dev:e2e 2>&1 | tee playwright-server.log',
    url: 'http://localhost:9999',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
