import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/memoir-book/',  // ← repo adın ne ise onu yaz
})