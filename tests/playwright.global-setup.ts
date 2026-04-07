import { setupTestEnvironment } from './test-setup';

export default async function playwrightGlobalSetup() {
  if (process.env.PLAYWRIGHT_PROJECT === 'lighthouse') {
    return;
  }
  await setupTestEnvironment();
}