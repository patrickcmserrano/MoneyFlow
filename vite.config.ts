import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte({
      extensions: ['.svelte', '.md'],
    }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/MoneyFlow/' : '/',
});