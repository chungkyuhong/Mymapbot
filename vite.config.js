import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
    allowedHosts: [
      '5173-illhsa38wy27xi3njh23r-2e77fc33.sandbox.novita.ai',
      '.sandbox.novita.ai'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
