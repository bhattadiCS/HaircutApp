import globalTeardown from './globalTeardown';
import { setupTestEnvironment } from './test-setup';

export default async function vitestGlobalSetup() {
  await setupTestEnvironment();

  return async () => {
    await globalTeardown();
  };
}