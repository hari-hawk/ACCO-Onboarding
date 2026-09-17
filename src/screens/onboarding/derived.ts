import { DOCDEFS, DOC_SRC, XFIELDS } from '../../lib/data';
import type { DocKey, KV } from '../../lib/types';
import { DEFAULT_TRADESMAN, useOnboarding } from '../../store/onboarding';

/* Values every onboarding stage reads: the tradesman identity, the per-document
   readiness, and the extracted field list with the specialist's edits applied. */
export function useObDerived() {
  const ctx = useOnboarding((s) => s.ctx);
  const docs = useOnboarding((s) => s.docs);
  const edits = useOnboarding((s) => s.edits);

  const name = ctx.prefilled ? ctx.name || '' : DEFAULT_TRADESMAN;
  const ctxF: Record<string, string> = {};
  ctx.fields?.forEach((f) => { ctxF[f.k] = f.v; });
  const dispatchMap: Record<string, string> = {
    'Legal first name': name.split(' ')[0],
    'Legal last name': name.split(' ').slice(1).join(' ') || '—',
    'Classification': ctx.prefilled ? ctxF['Classification'] || '' : 'Jrny Fitter',
    'Local union': ctx.prefilled ? ctxF['Local union'] || '' : '246 · UA Local 246',
    'Start date': ctx.prefilled ? ctxF['Start date'] || '' : '07/07/2026 · 6:00 AM',
  };
  const docReady = (k: DocKey) => docs[k].status === 'ready';
  const xfields = XFIELDS.map((f) => {
    const base = f.src === 'dispatch' ? dispatchMap[f.k] : f.sample ?? '';
    return { k: f.k, req: f.req, src: f.src, has: docReady(f.src), v: edits[f.k] ?? base, srcLabel: DOC_SRC[f.src] };
  });
  const recFields: KV[] = xfields.filter((f) => f.has).map(({ k, v }) => ({ k, v }));

  return {
    ctx,
    docs,
    name,
    title: ctx.prefilled ? ctx.name || '' : 'New onboarding',
    meta: ctx.prefilled ? `${ctx.lr} · ${ctx.site} · ${ctx.union}` : 'Not linked to a labor request yet — scan or upload documents to begin',
    site: ctx.site || 'Fresno Community Hospital — Central Plant',
    union: ctx.union || 'UA Local 246',
    cls: ctxF['Classification'] || '',
    start: ctxF['Start date'] || '',
    docReady,
    readyCount: DOCDEFS.filter((d) => docReady(d.key)).length,
    confirmDisabled: !(docReady('dispatch') && docReady('id') && docReady('bank')),
    xfields,
    recFields,
  };
}
