import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: './',
  // Use @aurum/react's source, so edits show up without rebuilding dist/.
  resolve: { conditions: ['aurum-source'] },
});
