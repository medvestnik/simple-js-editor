import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'JSEditor',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'editor.esm.js' : 'editor.umd.js')
    },
    sourcemap: true,
    outDir: 'dist'
  }
});
