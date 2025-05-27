import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'cybersafe_therapy/dist'),
    emptyOutDir: true,
  },
});
