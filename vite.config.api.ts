import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'api/index.ts'),
      name: 'api',
      fileName: () => 'api/index.js',
      formats: ['es'],
    },
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      external: [],
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: 'api/index.js',
      },
    },
    minify: false,
    sourcemap: true,
    ssr: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
});
