import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';

export default defineConfig({
  base: './',

  server: {
    host: 'woodsun.84.designplanet.ua',
    port: 80,
    fs: {
      strict: false
    }
  },

  build: {
    sourcemap: true,

    rollupOptions: {
      input: 'index.html'
    }
  },

  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  optimizeDeps: {
    include: ['three', 'postprocessing', 'realism-effects']
  }
});
