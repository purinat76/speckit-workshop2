import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'ES2020',
  },
  server: {
    port: 5173,
    open: true,
    strictPort: false,
  },
  optimizeDeps: {
    include: ['sql.js'],
  },
});
