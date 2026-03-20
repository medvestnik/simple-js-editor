import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: __dirname,
  publicDir: false,
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, '../../src')
    }
  }
});
