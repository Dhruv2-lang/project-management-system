import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The backend allows CORS from http://localhost:5173 by default (CLIENT_URL), so keep that dev port.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
