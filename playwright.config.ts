import { defineConfig, devices } from '@playwright/test';
import { TEST_ENV } from './tests/test-setup';

const baseURL = 'http://127.0.0.1:4173';
const lighthouseURL = 'http://127.0.0.1:4174/HaircutApp/';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  fullyParallel: true,
  workers: 4,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './tests/playwright.global-setup.ts',
  globalTeardown: './tests/globalTeardown.ts',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4173',
      url: baseURL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        ...TEST_ENV,
        VITE_DISABLE_PWA_DEV: 'true',
      },
    },
    {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4174',
      url: lighthouseURL,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        ...TEST_ENV,
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'iphone-15-pro',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 15 Pro'],
      },
    },
    {
      name: 'lighthouse',
      testMatch: /.*\.lighthouse\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: lighthouseURL,
      },
    },
  ],
});