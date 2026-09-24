import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Version stamp for design-fidelity tooling. Vercel exposes the deploying commit as an env
   var; local builds fall back to git. Mirrors scripts/design-reference.mjs. */
function commitSha(): string {
  const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (fromEnv) return fromEnv.slice(0, 7);
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return 'dev'; }
}

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __APP_COMMIT__: JSON.stringify(commitSha()),
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
  // Keep Vite's dependency cache outside the project: this folder lives on Google Drive,
  // and Drive re-syncing node_modules/.vite triggers spurious dev-server reloads.
  cacheDir: join(tmpdir(), 'acco-onboarding-ui-vite'),
  server: { port: 5173, open: false },
});
