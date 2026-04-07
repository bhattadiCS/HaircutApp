import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { useAppStore } from '../src/store/useAppStore';

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  cleanup();
  useAppStore.setState(useAppStore.getInitialState(), true);
});