/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { mondayDevApi } from './vite-plugins/monday-dev-api.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Must come before react(): it generates src/app/route-tree.gen.ts from src/app/routes.
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/app/routes',
      generatedRouteTree: './src/app/route-tree.gen.ts',
    }),
    react(),
    tailwindcss(),
    mondayDevApi(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // The Developer Center features point at http://localhost:5173/<route>. A different port breaks them.
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testing/setup-tests.ts'],
    restoreMocks: true,
  },
})
