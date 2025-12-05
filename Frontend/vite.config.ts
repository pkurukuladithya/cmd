// vite.config.js (or vite.config.ts)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import the plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Add the plugin to the array
  ],
})