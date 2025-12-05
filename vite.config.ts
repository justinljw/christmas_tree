import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Critical for GitHub Pages: ensures assets are loaded relative to index.html
  // instead of absolute root path (which fails in subdirectories).
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})