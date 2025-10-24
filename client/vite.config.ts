import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import checker from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';
import { sentryVitePlugin } from '@sentry/vite-plugin';

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
    // Upload source maps to Sentry on production builds
    sentryVitePlugin({
      org: 'craved-artisan',
      project: 'javascript-react',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Only upload source maps in production builds
      disable: process.env.NODE_ENV !== 'production',
      sourcemaps: {
        assets: './dist/**',
        filesToDeleteAfterUpload: './dist/**/*.map',
      },
      telemetry: false,
    }),
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
    // Enable strict checking
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext',
    // Memory optimization for large builds
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      external: ['zod/v4/core'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['axios', 'dayjs', 'zod']
        }
      },
      onwarn(warning, warn) {
        // Catch missing export errors early
        if (warning.code === 'MISSING_EXPORT') {
          throw new Error(`Missing export: ${warning.message}`);
        }
        if (warning.code === 'UNRESOLVED_IMPORT') {
          throw new Error(`Unresolved import: ${warning.message}`);
        }
        warn(warning);
      },
    },
  },
  // Enhanced development experience
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
});
