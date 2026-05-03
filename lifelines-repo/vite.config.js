import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base — works on any GitHub Pages URL (user.github.io/repo-name/)
  // and on Cloudflare Pages, Netlify, etc. with no config change.
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
