import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://sdokfrec.onrender.com',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // ไม่ต้องใช้ rewrite เพราะ URL ต้นทางมี /api อยู่แล้ว
      },
    },
  },
})
