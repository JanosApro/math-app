import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps the build working on any static host path (Cloudflare Pages, GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: './',
});
