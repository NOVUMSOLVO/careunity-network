import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Minimal Vite configuration
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "client"),
  server: {
    port: 3000,
    open: true, // Automatically open the browser
  },
});
