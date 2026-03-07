import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/agency-quote-system/' // 請將此處改為你的 GitHub 儲存庫名稱
})
