import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Caminhos relativos para funcionar em qualquer subpasta (ex.: GitHub Pages).
  base: './',
  plugins: [react()],
});
