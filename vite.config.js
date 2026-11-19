import { defineConfig } from 'vite';
import prerender from './scripts/vite-plugin-prerender.js';

// base './' → every asset path in the built output is relative, so dist/ works from any folder.
export default defineConfig({
  base: './',
  plugins: [prerender()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
  server: { open: false },
});
