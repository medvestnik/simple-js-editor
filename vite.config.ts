import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'SimpleJsEditor',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'simple-js-editor.esm.js' : 'simple-js-editor.umd.js'),
      cssFileName: 'simple-js-editor.css'
    },
    sourcemap: true,
    outDir: 'dist'
  }
});
