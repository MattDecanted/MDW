import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // ✅ Ensures _redirects is copied into the dist folder
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
