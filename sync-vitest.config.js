import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['client/src/services/__tests__/*.test.ts'],
    setupFiles: ['./client/src/test/setup.ts'],
    deps: {
      inline: ['jsdom']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared')
    }
  }
});
