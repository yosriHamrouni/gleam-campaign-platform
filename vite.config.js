// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { force: true },
  server: {
    port: 3008,
    proxy: {
      // ✅ ensure API calls from React reach the Express server correctly
      '/api': {
        target: 'http://localhost:3009',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  appType: 'spa',
})
