import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Los tests del adapter ejercitan el dataset mock; en runtime el mock
    // solo se activa con NEXT_PUBLIC_USE_MOCK=true explícito.
    env: { NEXT_PUBLIC_USE_MOCK: 'true' },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
