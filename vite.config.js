import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';

export default defineConfig({
  base: '/',

  // envDir,

  // server: {
  //   host: '0.0.0.0',
  //   port: 3002,
  //   fs: {
  //     strict: false
  //   }
  // },

  build: {
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
    include: ['three', 'postprocessing']
  }
});
