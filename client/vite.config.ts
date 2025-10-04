import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import checker from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';

// https://vite.dev/config/
export default defineConfig({
  base: "/", // important for dev
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Allow external connections
    hmr: {
      port: 5173,
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
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
