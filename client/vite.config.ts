import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import checker from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({ typescript: true }),
    inspect(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.cjs'),
  },
  optimizeDeps: {
    exclude: ['zod/v4/core'],
  },
  build: {
    rollupOptions: {
      external: ['zod/v4/core'],
    },
  },
});
