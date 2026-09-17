import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ACCOUNTS, DEMO_PIN, SEED_EMAILS, SEED_REQUESTS, type DraftKey } from '../lib/data';
import type { Account, AccountKey, EmailRec, LaborRequest, QueueItem } from '../lib/types';
import { clone } from '../lib/utils';

/* Workspace-level state: who is signed in and everything that outlives a screen. */
export interface AppState {
  account: AccountKey | null;
  /** Email typed in the Entra "use another account" flow; overrides the account email. */
  pendingEmail: string | null;
  requests: Record<AccountKey, LaborRequest[]>;
  emails: Record<AccountKey, EmailRec[]>;
  drafts: Record<AccountKey, DraftKey[]>;
  autoSend: Record<AccountKey, boolean>;
  digest: Record<AccountKey, boolean>;
  /** Requests the superintendent moved into the specialist's extraction queue. */
  obQueue: QueueItem[];
  /** Manual session-status overrides keyed by `${lr}|${name}`. */
  obStatusOv: Record<string, number>;
  /** Request ids whose off-platform documents were routed to the specialist. */
  mdSentFor: Record<string, boolean>;
  /** The specialist's verification PIN. */
  pin: string;
  emailGroupCollapsed: Record<string, boolean>;

  signIn: (key: AccountKey, email?: string | null) => void;
  signOut: () => void;
  updateRequest: (id: string, fn: (r: LaborRequest) => void) => void;
  addRequest: (r: LaborRequest) => void;
  addDraft: (key: DraftKey) => void;
  removeDraft: (key: DraftKey) => void;
  addEmails: (recs: EmailRec[]) => void;
  setEmailFlag: (id: string, unread: boolean) => void;
  toggleEmailGroup: (name: string) => void;
  toggleAutoSend: () => void;
  toggleDigest: () => void;
  enqueueOnboarding: (item: QueueItem) => void;
  setStatusOverride: (key: string, idx: number) => void;
  markMdSent: (id: string) => void;
  setPin: (pin: string) => void;
}

/* Persisted to sessionStorage so a reload or a deep link keeps the signed-in workspace
   for the tab's lifetime. Closing the tab signs out, like an SSO session cookie. */
export const useApp = create<AppState>()(persist((set, get) => ({
  account: null,
  pendingEmail: null,
  requests: clone(SEED_REQUESTS),
  emails: clone(SEED_EMAILS),
  drafts: { miguel: ['lax', 'kaiser'], dana: [], alex: [] },
  autoSend: { miguel: true, dana: false, alex: false },
  digest: { miguel: true, dana: false, alex: false },
  obQueue: [],
  obStatusOv: {},
  mdSentFor: {},
  pin: DEMO_PIN,
  emailGroupCollapsed: {},

  signIn: (key, email = null) => set({ account: key, pendingEmail: email }),
  signOut: () => set({ account: null, pendingEmail: null }),

  updateRequest: (id, fn) => {
    const { account } = get();
    if (!account) return;
    const requests = clone(get().requests);
    const r = requests[account].find((x) => x.id === id);
    if (r) fn(r);
    set({ requests });
  },
  addRequest: (r) => {
    const { account } = get();
    if (!account) return;
    const requests = clone(get().requests);
    requests[account] = [r].concat(requests[account].filter((x) => x.id !== r.id));
    set({ requests });
  },
  addDraft: (key) => {
    const { account, drafts } = get();
    if (!account) return;
    const cur = drafts[account];
    if (cur.includes(key)) return;
    set({ drafts: { ...drafts, [account]: cur.concat(key) } });
  },
  removeDraft: (key) => {
    const { account, drafts } = get();
    if (!account) return;
    set({ drafts: { ...drafts, [account]: drafts[account].filter((k) => k !== key) } });
  },
  addEmails: (recs) => {
    const { account, emails } = get();
    if (!account) return;
    set({ emails: { ...emails, [account]: recs.concat(emails[account]) } });
  },
  setEmailFlag: (id, unread) => {
    const { account } = get();
    if (!account) return;
    const emails = clone(get().emails);
    const rec = emails[account].find((e) => e.id === id);
    if (!rec || !!rec.unread === unread) return;
    rec.unread = unread;
    set({ emails });
  },
  toggleEmailGroup: (name) => set((s) => ({ emailGroupCollapsed: { ...s.emailGroupCollapsed, [name]: !s.emailGroupCollapsed[name] } })),
  toggleAutoSend: () => set((s) => (s.account ? { autoSend: { ...s.autoSend, [s.account]: !s.autoSend[s.account] } } : {})),
  toggleDigest: () => set((s) => (s.account ? { digest: { ...s.digest, [s.account]: !s.digest[s.account] } } : {})),
  enqueueOnboarding: (item) => set((s) => ({ obQueue: s.obQueue.concat(item) })),
  setStatusOverride: (key, idx) => set((s) => ({ obStatusOv: { ...s.obStatusOv, [key]: idx } })),
  markMdSent: (id) => set((s) => ({ mdSentFor: { ...s.mdSentFor, [id]: true } })),
  setPin: (pin) => set({ pin }),
}), { name: 'acco-onboarding-workspace', storage: createJSONStorage(() => sessionStorage) }));

/* ── Selectors ───────────────────────────────────────────────────────── */
export function useAccount(): Account | null {
  const key = useApp((s) => s.account);
  return key ? ACCOUNTS[key] : null;
}

export function useActiveEmail(): string {
  const key = useApp((s) => s.account);
  const pending = useApp((s) => s.pendingEmail);
  return pending || (key ? ACCOUNTS[key].email : '');
}

export function useRequests(): LaborRequest[] {
  const key = useApp((s) => s.account);
  const all = useApp((s) => s.requests);
  return key ? all[key] : [];
}

export function useEmails(): EmailRec[] {
  const key = useApp((s) => s.account);
  const all = useApp((s) => s.emails);
  return key ? all[key] : [];
}

export function useDrafts(): DraftKey[] {
  const key = useApp((s) => s.account);
  const all = useApp((s) => s.drafts);
  return key ? all[key] : [];
}

export function landingFor(key: AccountKey): string {
  return key === 'dana' ? '/onboardings' : '/dashboard';
}
