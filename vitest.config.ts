import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { TEST_ENV } from './tests/test-setup';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./tests/vitest.setup.ts'],
    globalSetup: ['./tests/vitest.global-setup.ts'],
    include: ['tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['tests/e2e/**', 'dist/**', 'node_modules/**'],
    env: TEST_ENV,
    maxWorkers: 1,
    minWorkers: 1,
    fileParallelism: false,
    testTimeout: 45_000,
    hookTimeout: 45_000,
  },
});