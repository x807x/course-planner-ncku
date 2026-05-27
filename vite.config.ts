import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 你可以指定喜歡的 port
    open: true,  // 啟動時自動打開瀏覽器
  },
});
