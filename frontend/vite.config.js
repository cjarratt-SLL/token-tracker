import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,          // Always use port 5173
    strictPort: true,    // Fail instead of picking a random new port
    host: '127.0.0.1',   // Bind explicitly to localhost
  },
})
