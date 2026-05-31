import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/financial-projector/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules\\recharts') || id.includes('node_modules/recharts')) {
            return 'recharts'
          }

          if (id.includes('node_modules\\motion') || id.includes('node_modules/motion')) {
            return 'motion'
          }
        },
      },
    },
  },
})
