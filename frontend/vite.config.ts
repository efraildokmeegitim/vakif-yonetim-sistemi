import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Chrome eklentilerinde local dosyaların çalışması için relative path şarttır
  optimizeDeps: {
    include: ['exceljs'],
    force: true, // Force optimization to clear cache issues
  }
})
