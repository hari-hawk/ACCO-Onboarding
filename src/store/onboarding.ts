import { create } from 'zustand';
import { DOC_SIM_NAMES } from '../lib/data';
import type { DocEntry, DocKey, ObCtx, ObDocs, ObStage, PreDoc, PreVerdict, Session } from '../lib/types';
import { nowTime } from '../lib/utils';

/* One onboarding session: identity check → documents → HCM profile → forms & sign → filed.
   Upload and HCM round-trips are simulated with timers, exactly as the prototype does. */

export type PreDocKey = 'id' | 'ssn';
export type DvKind = DocKey | `pre-${PreDocKey}`;

export interface DocViewer {
  open: boolean;
  page: 1 | 2;
  zoom: number;
  rot: number;
  kind: DvKind;
  url: string;
  name: string | null;
}

export interface OnboardingState {
  ctx: ObCtx;
  docs: ObDocs;
  edits: Record<string, string>;
  stage: ObStage;
  stageMax: number;
  clock: string | null;
  pkAgree: boolean;
  pkSigned: boolean;
  pkView: string | null;
  sigDrawn: boolean;
  sigData: string | null;
  pre: { first: string; last: string; ssn: string; dob: string };
  preResult: PreVerdict | null;
  preDocs: Record<PreDocKey, PreDoc>;
  pinOpen: boolean;
  pinFor: 'profile' | 'file' | null;
  pinVal: string;
  pinErr: boolean;
  hcmBusy: boolean;
  hcmBusyFor: 'profile' | 'file' | 'precheck' | null;
  dv: DocViewer;
  bankTried: boolean;
  fileUrls: Record<string, string>;

  startNew: () => void;
  resume: (s: Session) => void;
  setPre: (k: keyof OnboardingState['pre'], v: string) => void;
  fillPre: (f: string[]) => void;
  preUpload: (key: PreDocKey, nameOverride?: string) => void;
  checkIdentity: () => void;
  closePreResult: () => void;
  continueFromPrecheck: () => void;
  simUpload: (key: DocKey, append?: boolean, nameOverride?: string) => void;
  bulkUpload: (files: File[]) => void;
  registerFile: (file: File) => void;
  setEdit: (k: string, v: string) => void;
  confirmProfile: () => void;
  setStage: (s: ObStage) => void;
  selectStage: (id: string) => void;
  goSign: () => void;
  openPin: (which: 'profile' | 'file') => void;
  closePin: () => void;
  setPinVal: (v: string) => void;
  verifyPin: (expected: string) => void;
  toggleAgree: () => void;
  setSigDrawn: (v: boolean) => void;
  signAll: (sigData: string | null) => void;
  clearSig: () => void;
  setPkView: (t: string | null) => void;
  openDv: (patch: Partial<DocViewer>) => void;
  closeDv: () => void;
  dvPatch: (patch: Partial<DocViewer>) => void;
}

const EMPTY_DOC = (): ObDocs['dispatch'] => ({ status: 'empty', pct: 0, files: [] });
const EMPTY_PRE = (): PreDoc => ({ status: 'empty', pct: 0, file: '' });

export function initDocs(prefilled: boolean, docName?: string): ObDocs {
  return {
    dispatch: { status: prefilled ? 'ready' : 'empty', pct: 0, files: prefilled ? [{ name: docName || 'dispatch-slip.pdf', time: 'via email' }] : [] },
    id: EMPTY_DOC(),
    ssn: EMPTY_DOC(),
    bank: EMPTY_DOC(),
  };
}

const fresh = () => ({
  ctx: { prefilled: false } as ObCtx,
  docs: initDocs(false),
  edits: {},
  stage: 'precheck' as ObStage,
  stageMax: 0,
  clock: null,
  pkAgree: false,
  pkSigned: false,
  pkView: null,
  sigDrawn: false,
  sigData: null,
  pre: { first: '', last: '', ssn: '', dob: '' },
  preResult: null,
  preDocs: { id: EMPTY_PRE(), ssn: EMPTY_PRE() },
  pinOpen: false,
  pinFor: null,
  pinVal: '',
  pinErr: false,
  hcmBusy: false,
  hcmBusyFor: null,
  dv: { open: false, page: 1 as const, zoom: 1, rot: 0, kind: 'dispatch' as DvKind, url: '', name: null },
});

const timers = new Map<string, ReturnType<typeof setInterval>>();
function clearTimer(k: string) {
  const t = timers.get(k);
  if (t) clearInterval(t);
  timers.delete(k);
}
function clearAllTimers() {
  timers.forEach((t) => clearInterval(t));
  timers.clear();
}

const STAGE_ORDER = ['identity', 'extract', 'profile', 'sign', 'file'];
export function stageKey(stage: ObStage): string {
  return stage === 'filed' ? 'file' : stage === 'precheck' ? 'identity' : stage;
}

export const useOnboarding = create<OnboardingState>((set, get) => ({
  ...fresh(),
  bankTried: false,
  fileUrls: {},

  startNew: () => {
    clearAllTimers();
    set({ ...fresh(), bankTried: false });
  },

  resume: (s) => {
    clearAllTimers();
    const docs: ObDocs = s.full
      ? {
          dispatch: { status: 'ready', pct: 100, files: [{ name: s.doc, time: '' }] },
          id: { status: 'ready', pct: 100, files: [{ name: 'William Stout (DL-CA).pdf', time: '' }] },
          ssn: { status: 'ready', pct: 100, files: [{ name: 'William Stout (SSN).png', time: '' }] },
          bank: { status: 'ready', pct: 100, files: [{ name: 'WILLIAM STOUT - VOID CHECK.png', time: '' }] },
        }
      : initDocs(true, s.doc);
    set({
      ...fresh(),
      bankTried: true,
      ctx: { prefilled: true, lr: s.lr, site: s.site, union: s.union, name: s.name, doc: s.doc, fields: s.fields },
      docs,
      stage: 'extract',
      stageMax: 1,
    });
  },

  setPre: (k, v) => set((st) => ({ pre: { ...st.pre, [k]: v } })),
  fillPre: (f) => {
    set({ pre: { first: f[0], last: f[1], ssn: f[2], dob: f[3] } });
    get().checkIdentity();
  },

  preUpload: (key, nameOverride) => {
    const tk = 'pre-' + key;
    clearTimer(tk);
    const patch = (p: Partial<PreDoc>) => set((st) => ({ preDocs: { ...st.preDocs, [key]: { ...st.preDocs[key], ...p } } }));
    patch({ status: 'uploading', pct: 0 });
    let pct = 0;
    timers.set(tk, setInterval(() => {
      pct = Math.min(100, pct + 25);
      if (pct >= 100) {
        clearTimer(tk);
        patch({ status: 'ready', pct: 100, file: nameOverride || (key === 'id' ? 'photo-id-passport.jpg' : 'ssn-card.png') });
        set((st) => key === 'id'
          ? { pre: { ...st.pre, first: st.pre.first || 'William', last: st.pre.last || 'Stout', dob: st.pre.dob || '08/26/1993' } }
          : { pre: { ...st.pre, ssn: st.pre.ssn || '602-68-8840' } });
      } else patch({ pct });
    }, 240));
  },

  checkIdentity: () => {
    set({ hcmBusy: true, hcmBusyFor: 'precheck' });
    setTimeout(() => {
      const last = get().pre.last.trim().toLowerCase();
      const verdict: PreVerdict = last === 'okafor' ? 'rehire' : last === 'anand' ? 'dnh' : last === 'stout' ? 'new' : 'noverify';
      set({ hcmBusy: false, hcmBusyFor: null, preResult: verdict });
    }, 1300);
  },
  closePreResult: () => set({ preResult: null }),

  continueFromPrecheck: () => {
    const st = get();
    const nm = `${st.pre.first} ${st.pre.last}`.trim();
    if (st.preResult === 'rehire') {
      set({
        preResult: null,
        stage: 'extract',
        stageMax: Math.max(st.stageMax, 1),
        bankTried: true,
        ctx: {
          prefilled: true, lr: 'LR-2026-0142', site: 'LAX Terminal 9 — Central Utility Plant', union: 'UA Local 78', name: nm, doc: 'dispatch-okafor.pdf',
          fields: [{ k: 'Tradesman name', v: nm, conf: 'high' }, { k: 'Classification', v: 'Foreman — Plumber', conf: 'high' }, { k: 'Local union', v: '078 · UA Local 78', conf: 'high' }, { k: 'Start date', v: 'Mon, Sep 21, 2026 · 6:00 AM', conf: 'high' }],
        },
        docs: {
          dispatch: { status: 'ready', pct: 100, files: [{ name: 'dispatch-okafor.pdf', time: '' }] },
          id: { status: 'ready', pct: 100, files: [{ name: 'okafor-dl-ca.pdf', time: '' }] },
          ssn: { status: 'ready', pct: 100, files: [{ name: 'okafor-ssn.png', time: '' }] },
          bank: { status: 'ready', pct: 100, files: [{ name: 'okafor-void-check.png', time: '' }] },
        },
        edits: {},
      });
    } else {
      set({ preResult: null, stage: 'extract', stageMax: Math.max(st.stageMax, 1), bankTried: false, ctx: { prefilled: false }, docs: initDocs(false), edits: {} });
    }
  },

  simUpload: (key, append = false, nameOverride) => {
    const cur = get().docs[key];
    if (cur.status === 'uploading' || cur.status === 'scanning') return;
    clearTimer(key);
    const setDoc = (p: Partial<ObDocs[DocKey]>) => set((st) => ({ docs: { ...st.docs, [key]: { ...st.docs[key], ...p } } }));
    setDoc({ status: 'uploading', pct: 0 });
    let pct = 0;
    timers.set(key, setInterval(() => {
      pct = Math.min(100, pct + 20);
      if (pct >= 100) {
        clearTimer(key);
        setDoc({ status: 'scanning', pct: 100 });
        setTimeout(() => {
          const fail = key === 'bank' && !get().bankTried;
          if (key === 'bank') set({ bankTried: true });
          if (fail) { setDoc({ status: 'error' }); return; }
          set((st) => {
            const d = { ...st.docs[key] };
            const existing = d.files;
            const base = nameOverride || DOC_SIM_NAMES[key];
            const name = !nameOverride && existing.length > 0 ? base.replace(/\.(\w+)$/, `-${existing.length + 1}.$1`) : base;
            const entry: DocEntry = { name, time: nowTime() };
            if (append) d.files = existing.concat(entry);
            else {
              if (existing.length) d.history = (d.history || []).concat(existing.map((f) => ({ name: f.name, time: nowTime() })));
              d.files = [entry];
            }
            d.status = 'ready';
            return { docs: { ...st.docs, [key]: d } };
          });
        }, 1000);
      } else setDoc({ pct });
    }, 280));
  },

  registerFile: (file) => {
    set((st) => ({ fileUrls: { ...st.fileUrls, [file.name]: URL.createObjectURL(file) } }));
  },

  bulkUpload: (files) => {
    const order: DocKey[] = ['dispatch', 'id', 'ssn', 'bank'];
    const cur = get().docs;
    let fi = 0;
    order.forEach((k) => {
      if (fi >= files.length) return;
      if (cur[k].status === 'empty' || cur[k].status === 'error') {
        const fl = files[fi++];
        get().registerFile(fl);
        get().simUpload(k, false, fl.name);
      }
    });
  },

  setEdit: (k, v) => set((st) => ({ edits: { ...st.edits, [k]: v } })),

  confirmProfile: () => {
    const d = get().docs;
    if (d.dispatch.status === 'ready' && d.id.status === 'ready' && d.bank.status === 'ready') {
      set((st) => ({ stage: 'profile', stageMax: Math.max(st.stageMax, 2) }));
    }
  },
  setStage: (stage) => set({ stage }),
  selectStage: (id) => {
    const st = get();
    const idx = STAGE_ORDER.indexOf(id);
    if (idx === STAGE_ORDER.indexOf(stageKey(st.stage)) || idx > st.stageMax) return;
    set({ stage: id === 'file' ? 'filed' : id === 'identity' ? 'precheck' : (id as ObStage) });
  },
  goSign: () => set((st) => ({ stage: 'sign', stageMax: Math.max(st.stageMax, 3) })),

  openPin: (which) => {
    if (which === 'file' && !get().pkSigned) return;
    set({ pinOpen: true, pinFor: which, pinVal: '', pinErr: false });
  },
  closePin: () => set({ pinOpen: false, pinErr: false }),
  setPinVal: (v) => set({ pinVal: v.replace(/\D/g, '').slice(0, 6), pinErr: false }),
  verifyPin: (expected) => {
    const st = get();
    if (st.pinVal !== expected) { set({ pinErr: true }); return; }
    const which = st.pinFor;
    set({ pinOpen: false, hcmBusy: true, hcmBusyFor: which });
    setTimeout(() => {
      if (which === 'profile') {
        const nm = get().ctx.name || '';
        set({ hcmBusy: false, hcmBusyFor: null, clock: nm.includes('Marcus') ? '512446' : '667003' });
      } else {
        set({ hcmBusy: false, hcmBusyFor: null, stage: 'filed', stageMax: 4 });
      }
    }, 1400);
  },

  toggleAgree: () => set((st) => ({ pkAgree: !st.pkAgree })),
  setSigDrawn: (v) => set({ sigDrawn: v }),
  signAll: (sigData) => {
    const st = get();
    if (!st.pkAgree || !st.sigDrawn) return;
    set({ pkSigned: true, sigData });
  },
  clearSig: () => set({ sigDrawn: false }),
  setPkView: (t) => set({ pkView: t }),

  openDv: (patch) => set((st) => ({ dv: { ...st.dv, open: true, page: 1, zoom: 1, rot: 0, url: '', name: null, ...patch } })),
  closeDv: () => set((st) => ({ dv: { ...st.dv, open: false } })),
  dvPatch: (patch) => set((st) => ({ dv: { ...st.dv, ...patch } })),
}));

/** Name used for extraction when no dispatch context is linked. */
export const DEFAULT_TRADESMAN = 'William Stout';
