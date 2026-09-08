import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
  },
  test: {
    environment: 'node',
    globals: true,
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    include: ['tesseract.js'],
  },
});
