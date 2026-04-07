import { clearEmulatorData, stopFirebaseEmulators } from './test-setup';

export default async function globalTeardown() {
  await clearEmulatorData();
  await stopFirebaseEmulators();
}