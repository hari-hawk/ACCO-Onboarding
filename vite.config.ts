import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  // Keep Vite's dependency cache outside the project: this folder lives on Google Drive,
  // and Drive re-syncing node_modules/.vite triggers spurious dev-server reloads.
  cacheDir: join(tmpdir(), 'acco-onboarding-ui-vite'),
  server: { port: 5173, open: false },
});
