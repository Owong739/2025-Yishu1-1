import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    // ← 這裡是新增的部分
    proxy: {
      // 所有以 /api 開頭的請求，都轉發到後端伺服器（localhost:3000）
      '/api': {
        target: 'http://localhost:3000',   // backend server.js running in port 3000 
        changeOrigin: true,                // 改變請求的 origin，讓後端以為是從 3000 來的
        secure: false,                     // 如果不是 https，可加這行避免警告
      },
    },
  },
})