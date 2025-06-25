import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 12001,
    cors: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        alter: 'src/alter.html'
      }
    }
  }
});
