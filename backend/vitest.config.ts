import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    fileParallelism: false, // all test files share one PostgreSQL test database
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
