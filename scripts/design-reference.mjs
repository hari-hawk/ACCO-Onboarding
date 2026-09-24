#!/usr/bin/env node
/* Generates public/design-reference.json (served at /design-reference.json) and refreshes the
   generated tables in DESIGN-REFERENCE.md. Runs automatically before `npm run dev` and
   `npm run build`, so every deploy carries a fresh stamp.

   Everything that can be derived is derived from source:
     routes        src/App.tsx            (<Route path="…">)
     hooks         src/**\/*.tsx           (data-ds="…" attributes)
     roles/states  src/lib/preview.ts     (ROLES / STATES)
     flags         src/lib/flags.ts, src/lib/data.ts
     tokens        src/styles/acco-tokens.css (count only; the file itself is the source)
   The one hand-maintained input is SCREEN_STATUS below: fidelity is a judgement, not a
   derivable fact. The script fails if a route has no status entry, so the two cannot drift. */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

/* ── Per-screen fidelity. final = matches the Claude Design artboard; in-progress = built but
   knowingly diverging; not-started = no design exists. ───────────────────────────────── */
const SCREEN_STATUS = {
  '/login':                { screen: 'Login',            status: 'final', roles: ['miguel', 'dana', 'alex'], note: 'Entra sign-in is simulated; any listed demo identity signs in.' },
  '/':                     { screen: 'Landing redirect', status: 'final', roles: ['miguel', 'dana', 'alex'], note: 'Redirects to /dashboard (superintendents) or /onboardings (specialist).' },
  '/dashboard':            { screen: 'Dashboard',        status: 'final', roles: ['miguel', 'alex'], note: '"Next on requests" guidance block hidden by flag (SHOW_NEXT_STEP_GUIDANCE).' },
  '/requests/new':         { screen: 'LaborRequestForm', status: 'final', roles: ['miguel', 'alex'], note: 'Classification footer note hidden by flag; start date uses the custom DateTimePicker.' },
  '/requests/:id':         { screen: 'RequestDetail',    status: 'final', roles: ['miguel', 'alex'], note: '"What happens next" guidance block hidden by flag.' },
  '/requests/:id/edit':    { screen: 'LaborRequestForm', status: 'final', roles: ['miguel', 'alex'] },
  '/drafts/:key':          { screen: 'LaborRequestForm', status: 'final', roles: ['miguel', 'alex'] },
  '/emails':               { screen: 'Emails',           status: 'final', roles: ['miguel', 'alex'] },
  '/reports':              { screen: 'Reports',          status: 'final', roles: ['miguel', 'dana', 'alex'], note: 'Rows open /reports/record/:ref. Expired 30-minute sessions appear as "Delayed".' },
  '/reports/record/:ref':  { screen: 'ReportRecord',     status: 'final', roles: ['miguel', 'dana', 'alex'] },
  '/profile':              { screen: 'MyProfile',        status: 'final', roles: ['miguel', 'dana', 'alex'] },
  '/onboardings':          { screen: 'OnboardingList',   status: 'final', roles: ['dana'], note: 'Superintendents are redirected; the list is specialist-only by design.' },
  '/onboarding':           { screen: 'Onboarding',       status: 'final', roles: ['miguel', 'dana', 'alex'], note: 'Stages: identity → extract → profile → sign → filed. 30-minute session timer starts after identity check.' },
};

/* Cross-cutting states that are not routes. */
const UI_STATES = {
  empty:   { status: 'final',       url: '/?as=alex#/dashboard', alsoVia: '?state=empty on any role', note: 'Alex is the seeded empty workspace; ?state=empty forces empty lists for any role.' },
  loading: { status: 'not-started', note: 'Skeleton "Paper" placeholders exist only inside the onboarding extract step; no page-level loading design.' },
  error:   { status: 'not-started', note: 'No error/offline state was designed. Simulated backends never fail except the scripted identity outcomes.' },
  mobile:  { status: 'in-progress', note: 'Artboard is 1440×900. The build is fluid down to ~360px, but narrow layouts are engineering judgement, not design.' },
};

/* ── Derived facts ─────────────────────────────────────────────────────────────────── */
function commit() {
  const env = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (env) return env.slice(0, 7);
  try { return execSync('git rev-parse --short HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return 'dev'; }
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

function routes() {
  const src = read('src/App.tsx');
  const found = [];
  for (const m of src.matchAll(/<Route\s+(index|path="([^"]+)")[^>]*element=\{[^<]*<([A-Za-z]+)/g)) {
    if (m[2] === '*') continue;
    const path = m[1] === 'index' ? '/' : (m[2].startsWith('/') ? m[2] : `/${m[2]}`);
    found.push({ path, element: m[3] });
  }
  return found;
}

function hooks() {
  const byName = new Map();
  const modifiers = new Set();
  for (const file of walk(join(ROOT, 'src'))) {
    const src = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file);
    for (const m of src.matchAll(/data-ds=(?:"([a-z][a-z0-9-]*)"|\{([^}]*)\})/g)) {
      // Dynamic form: only the ternary outcomes (after ? or :) are hook names, not the tested values.
      const names = m[1] ? [m[1]] : [...m[2].matchAll(/[?:]\s*'([a-z][a-z0-9-]*)'/g)].map((x) => x[1]);
      for (const n of names) {
        const e = byName.get(n) || { count: 0, files: new Set() };
        e.count += 1; e.files.add(rel); byName.set(n, e);
      }
    }
    for (const m of src.matchAll(/data-ds-([a-z]+)=/g)) modifiers.add(`data-ds-${m[1]}`);
  }
  const list = [...byName.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, e]) => ({ name, selector: `[data-ds="${name}"]`, occurrences: e.count, files: [...e.files].sort() }));
  return { list, modifiers: [...modifiers].sort() };
}

function constList(file, name) {
  const m = read(file).match(new RegExp(`export const ${name}[^=]*=\\s*\\[([^\\]]*)\\]`));
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
}
function constValue(file, name) {
  const m = read(file).match(new RegExp(`export const ${name}\\s*=\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}

const pkg = JSON.parse(read('package.json'));
const roles = constList('src/lib/preview.ts', 'ROLES');
const states = constList('src/lib/preview.ts', 'STATES');
const routeList = routes();

const missing = routeList.filter((r) => !SCREEN_STATUS[r.path]);
if (missing.length) { console.error('design-reference: routes without a status entry:', missing.map((r) => r.path)); process.exit(1); }
const stale = Object.keys(SCREEN_STATUS).filter((p) => !routeList.some((r) => r.path === p));
if (stale.length) { console.error('design-reference: status entries for routes that no longer exist:', stale); process.exit(1); }

const screens = routeList.map((r) => {
  const s = SCREEN_STATUS[r.path];
  const role = s.roles[0];
  return {
    route: r.path,
    hashUrl: `/#${r.path}`,
    previewUrl: `/?as=${role}#${r.path}`,
    screen: s.screen,
    component: [`src/screens/${s.screen}.tsx`, `src/screens/onboarding/${s.screen}.tsx`].find((f) => existsSync(join(ROOT, f))) || 'src/App.tsx',
    status: s.status,
    roles: s.roles,
    ...(s.note ? { note: s.note } : {}),
  };
});

const tokenCount = (read('src/styles/acco-tokens.css').match(/^\s*--[a-z0-9-]+\s*:/gm) || []).length;
const h = hooks();

const reference = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  name: pkg.name,
  version: pkg.version,
  commit: commit(),
  builtAt: new Date().toISOString(),
  repository: 'https://github.com/hari-hawk/ACCO-Onboarding',
  deployment: 'https://accoonboarding.vercel.app',
  docs: 'DESIGN-REFERENCE.md',
  routing: {
    mode: 'hash',
    note: 'All screens live under /#/<route>. Query flags go BEFORE the hash: /?as=dana&state=empty#/onboardings',
  },
  access: {
    roleFlag: { param: 'as', values: roles, example: `/?as=${roles[0]}#/dashboard`, note: 'Signs in without the Entra/PIN flow. Persists for the tab (sessionStorage).' },
    stateFlag: { param: 'state', values: states, example: `/?as=${roles[0]}&state=empty#/dashboard` },
    demoPin: '482917',
    stamp: {
      html: ['data-app-commit', 'data-app-built-at', 'data-preview-state'],
      global: 'window.__ACCO_DESIGN__',
    },
  },
  screens,
  states: UI_STATES,
  hooks: { attribute: 'data-ds', modifiers: h.modifiers, list: h.list },
  flags: {
    SHOW_NEXT_STEP_GUIDANCE: constValue('src/lib/flags.ts', 'SHOW_NEXT_STEP_GUIDANCE'),
    SESSION_MINUTES: constValue('src/lib/data.ts', 'SESSION_MINUTES'),
    FILED_RETURN_SECONDS: constValue('src/lib/data.ts', 'FILED_RETURN_SECONDS'),
  },
  tokens: { file: 'src/styles/acco-tokens.css', count: tokenCount, fonts: 'src/styles/fonts.css' },
  designSystem: { primitives: 'src/ds', components: 'src/components' },
};

mkdirSync(join(ROOT, 'public'), { recursive: true });
writeFileSync(join(ROOT, 'public/design-reference.json'), JSON.stringify(reference, null, 2) + '\n');

/* ── Refresh generated tables in DESIGN-REFERENCE.md ──────────────────────────────── */
const mdPath = join(ROOT, 'DESIGN-REFERENCE.md');
let md;
try { md = readFileSync(mdPath, 'utf8'); } catch { md = null; }
if (md) {
  const screenRows = screens.map((s) => `| \`${s.route}\` | ${s.screen} | **${s.status}** | ${s.roles.join(', ')} | ${s.note || ''} |`).join('\n');
  const screenTable = `| Route | Screen | Status | Roles | Notes |\n|---|---|---|---|---|\n${screenRows}`;
  const stateRows = Object.entries(UI_STATES).map(([k, v]) => `| ${k} | **${v.status}** | ${v.url ? `\`${v.url}\`` : ''} | ${v.note} |`).join('\n');
  const stateTable = `| State | Status | Example | Notes |\n|---|---|---|---|\n${stateRows}`;
  const hookRows = h.list.map((x) => `| \`${x.selector}\` | ${x.occurrences} | ${x.files.map((f) => `\`${f}\``).join(', ')} |`).join('\n');
  const hookTable = `| Selector | Uses | Files |\n|---|---|---|\n${hookRows}\n\nModifier attributes: ${h.modifiers.map((m) => `\`${m}\``).join(', ')}.`;
  const replace = (key, body) => {
    const re = new RegExp(`(<!-- ${key}:start -->)[\\s\\S]*?(<!-- ${key}:end -->)`);
    if (!re.test(md)) throw new Error(`DESIGN-REFERENCE.md is missing <!-- ${key}:start/end --> markers`);
    md = md.replace(re, `$1\n${body}\n$2`);
  };
  replace('screens', screenTable);
  replace('states', stateTable);
  replace('hooks', hookTable);
  // No timestamp here: the tables only change when source changes, so the file stays clean in git.
  replace('stamp', 'Tables below are regenerated from the source tree on every build. The commit and build time live in `/design-reference.json`.');
  writeFileSync(mdPath, md);
}

console.log(`design-reference: ${screens.length} screens, ${h.list.length} hooks, commit ${reference.commit} → public/design-reference.json`);
