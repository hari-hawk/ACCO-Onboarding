import type { AccountKey } from './types';

/* URL flags for headless review of the prototype. The app uses hash routing, so flags
   sit in the query string BEFORE the hash:

     /?as=dana#/onboardings                 sign in as a role without the Entra flow
     /?as=miguel&state=empty#/dashboard     force the empty-workspace variant

   Roles: miguel (superintendent, seeded), dana (onboarding specialist), alex (superintendent,
   empty workspace). States: empty. Loading and error states are not designed; see
   DESIGN-REFERENCE.md. scripts/design-reference.mjs reads ROLES and STATES from this file. */

export const ROLES: AccountKey[] = ['miguel', 'dana', 'alex'];
export const STATES = ['empty'] as const;
export type PreviewState = (typeof STATES)[number];

function read(): { as: AccountKey | null; state: PreviewState | null; empty: boolean } {
  if (typeof window === 'undefined') return { as: null, state: null, empty: false };
  const q = new URLSearchParams(window.location.search);
  const as = q.get('as');
  const state = q.get('state');
  const okState = (STATES as readonly string[]).includes(state ?? '') ? (state as PreviewState) : null;
  return {
    as: (ROLES as string[]).includes(as ?? '') ? (as as AccountKey) : null,
    state: okState,
    empty: okState === 'empty',
  };
}

export const PREVIEW = read();

/** Build metadata stamped at compile time (see vite.config.ts). */
export const BUILD = {
  commit: __APP_COMMIT__,
  builtAt: __APP_BUILT_AT__,
};

declare global {
  interface Window { __ACCO_DESIGN__: typeof BUILD & { preview: typeof PREVIEW; reference: string } }
}
