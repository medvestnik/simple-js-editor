import { defineConfig } from 'vite';
import path from 'node:path';

const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  root: __dirname,
  base: basePath,
  publicDir: false,
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0')
  },
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, '../../src')
    }
  }
});
