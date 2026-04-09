import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Remova qualquer linha que diga 'root: "client"'
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Aqui dizemos para ele que o index.html está na raiz agora
      input: path.resolve(__dirname, 'index.html'),
    },
  },
});