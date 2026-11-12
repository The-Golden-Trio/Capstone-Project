/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Staff app (Content Admin, Domain Expert): app riêng, cùng origin với API,
 * chỉ staff tải (DR-7). Base `/staff/`, dev ở cổng 4300.
 */
export default defineConfig(() => ({
  root: import.meta.dirname,
  base: '/staff/',
  cacheDir: '../../node_modules/.vite/apps/staff',
  server: {
    port: 4300,
    host: 'localhost',
    proxy: {
      '/api': {
        target: process.env['STAFF_API_PROXY'] ?? 'http://localhost:3000',
        changeOrigin: false,
      },
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: '@datn/staff',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
