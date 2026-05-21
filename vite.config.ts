import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/tennisplatz-finder/',
  plugins: [react()],
  test: {
    globals: false,
    environment: 'node',
  },
});
