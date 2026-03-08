import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/chen/' // 已修正為符合你的 GitHub 儲存庫名稱 chen
})
