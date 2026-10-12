import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Uncomment if you want to enable coverage
    // coverage: {
    //   provider: 'v8',
    //   reporter: ['text', 'json', 'html'],
    // },
  },
});
