import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // AGGIUNGIAMO QUESTA PARTE QUI SOTTO:
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
})