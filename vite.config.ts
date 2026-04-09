import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './', // Onde está o seu index.html
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Isso diz: Sempre que ver "@", olhe dentro de client/src
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
});