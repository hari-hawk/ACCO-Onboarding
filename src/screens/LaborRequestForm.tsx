import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Icon, IconButton } from '../ds';
import { ACCOUNTS, DRAFT_DEFS, EMPTY_CLASS, EMPTY_FORM, OPTS, SAMPLE_FORM, TEAM_ADDRESS, UNIONS, UNION_EMAILS, type DraftKey } from '../lib/data';
import type { Classification, EmailRec, FormClass, FormMode, KV, LaborForm, LaborRequest } from '../lib/types';
import { useAccount, useActiveEmail, useApp } from '../store/app';
import { clone, unionCode, unionShort } from '../lib/utils';
import { SelectMenu, UnionMultiSelect } from '../components/SelectMenu';
import { DateTimePicker } from '../components/DateTimePicker';
import { SHOW_NEXT_STEP_GUIDANCE } from '../lib/flags';
import { Pill } from '../components/Pill';

const F = (k: string, v: string): KV => ({ k, v });
type Lrx = 'idle' | 'busy' | 'done';

function initialForm(mode: FormMode, draftKey: string | undefined, acctName: string): LaborForm {
  if (mode === 'draft' && draftKey && draftKey in DRAFT_DEFS) {
    return { ...clone(DRAFT_DEFS[draftKey as DraftKey].form), requestor: acctName, specialist: acctName };
  }
  if (mode === 'edit') {
    return { ...clone(SAMPLE_FORM), hm: 'T. Nguyen — Field Ops', specialist: acctName };
  }
  return { ...clone(EMPTY_FORM), requestor: acctName, specialist: acctName };
}

function Section({ n, title, sub, actions, children, right }: { n: number; title: string; sub?: string; actions?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card card-open" style={{ flex: '0 0 auto' }}>
      <div className="card-head" style={{ padding: '14px 24px' }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="step-no">{n}</span>
          <div className="col" style={{ gap: 1 }}>
            <h2 className="h3">{title}</h2>
            {sub && <span className="sub">{sub}</span>}
          </div>
        </div>
        {actions}
        {right}
      </div>
      {children}
    </div>
  );
}

export function LaborRequestForm({ mode }: { mode: FormMode }) {
  const navigate = useNavigate();
  const { id, key: draftKey } = useParams();
  const acct = useAccount()!;
  const email = useActiveEmail();
  const acctKey = useApp((s) => s.account)!;
  const autoSend = useApp((s) => s.autoSend[acctKey]);
  const addRequest = useApp((s) => s.addRequest);
  const updateRequest = useApp((s) => s.updateRequest);
  const addEmails = useApp((s) => s.addEmails);
  const addDraft = useApp((s) => s.addDraft);
  const removeDraft = useApp((s) => s.removeDraft);

  const [form, setForm] = useState<LaborForm>(() => initialForm(mode, draftKey, acct.name));
  const [lrx, setLrx] = useState<Lrx>('idle');
  const [lrxFile, setLrxFile] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof LaborForm>(k: K, v: LaborForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setCls = (i: number, patch: Partial<FormClass>) => setForm((f) => ({ ...f, classes: f.classes.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));

  const totalNew = form.classes.reduce((a, c) => a + c.open, 0);
  const canSubmit = !!(form.requestor && form.hm && form.siteName.trim() && form.contactName.trim() && form.classes[0].trade && form.classes[0].union);
  const isEdit = mode === 'edit';

  const cancel = () => navigate(isEdit && id ? `/requests/${id}` : '/dashboard');
  const saveDraft = () => {
    if (isEdit && id) { navigate(`/requests/${id}`); return; }
    addDraft((draftKey as DraftKey) || 'lax');
    navigate('/dashboard');
  };

  const onLrxFile = (f: File | undefined) => {
    if (!f) return;
    setLrx('busy'); setLrxFile(f.name);
    setTimeout(() => {
      setForm((cur) => ({ ...clone(SAMPLE_FORM), requestor: cur.requestor || acct.name, specialist: cur.specialist || SAMPLE_FORM.specialist }));
      setLrx('done');
    }, 1400);
  };
  const lrxUndo = () => { setForm((cur) => ({ ...clone(EMPTY_FORM), requestor: acct.name, specialist: cur.specialist })); setLrx('idle'); setLrxFile(''); };

  const submit = () => {
    if (!canSubmit) return;
    if (isEdit && id) {
      updateRequest(id, (r) => r.activity.push({ t: 'Sep 7, just now', label: 'Request edited — HCM labor records updated instantly' }));
      navigate(`/requests/${id}`);
      return;
    }
    const acctB = ACCOUNTS[acctKey];
    const classes: Classification[] = form.classes.map((c, ci) => ({
      recNo: `HCM-0143-C${ci + 1}`,
      code: (c.trade || 'TBD ·').split(' · ')[0],
      trade: (c.trade || '· TBD').split(' · ')[1] || 'TBD',
      level: c.level || 'TBD',
      title: c.title || c.level || 'TBD',
      open: c.open, got: 0, union: c.union || 'TBD',
    }));
    const total = classes.reduce((a, c) => a + c.open, 0);
    const nr: LaborRequest = {
      id: 'LR-2026-0143', owner: acctB.name, site: form.siteName,
      cls: classes.map((c) => `${c.open} ${c.title}`).join(' · '), filled: 0, total, status: 'awaiting', submitted: 'Sep 7, 2026', by: acctB.email, emailed: false,
      pendNote: `${unionShort(classes[0].union) || 'Union'} · ${classes.length} classification${classes.length > 1 ? 's' : ''}`, pendBadge: 'Not emailed yet',
      fields: [F('Labor requestor', form.requestor), F('Onboarding specialist', form.specialist || acctB.name), F('Start date & time', form.start || 'TBD'), F('Expiration', form.expiration === 'until' ? 'Until filled' : 'On date'), F('Supervisor', form.supervisor || '—'), F('Hiring manager', form.hm), F('Department', form.dept || '—'), F('Location', form.location || '—'), F('Special requests', form.special || 'None')],
      siteFields: [F('Job site name', form.siteName), F('Job site address', form.siteAddress.replace(/\n/g, ', ')), F('Site instructions', form.siteInstr || 'None'), F('Contact name', form.contactName), F('Contact phone', form.contactPhone || '—'), F('Contact email', form.contactEmail || '—'), F('Legal employer', form.employer || '—'), F('Business unit', form.bu || '—')],
      classes,
      activity: [
        { t: 'Sep 7, just now', label: `Submitted — ${classes.length} HCM labor record${classes.length > 1 ? 's' : ''} created instantly via the HCM connection` },
        { t: 'Sep 7, just now', label: 'Not yet emailed to the union — draft the union email from this page' },
      ],
    };
    if (autoSend) {
      const byUnion: Record<string, Classification[]> = {};
      classes.forEach((c) => c.union.split(' + ').filter(Boolean).forEach((u) => { (byUnion[u] = byUnion[u] || []).push(c); }));
      const unionNames = Object.keys(byUnion);
      const recs: EmailRec[] = unionNames.map((u, i) => {
        const cls = byUnion[u];
        return {
          id: `auto-${Date.now()}-${i}`, dir: 'out', peer: unionShort(u),
          subject: `Labor request ${nr.id} — ${cls.reduce((a, c) => a + c.open, 0)} openings — ${form.siteName}`,
          time: 'Just now', status: 'awaiting response', fromAddr: TEAM_ADDRESS, toAddr: UNION_EMAILS[unionCode(u)] || 'dispatch@union.org', cc: acctB.email,
          attach: [{ name: `${nr.id}-labor-request-form.pdf` }], ref: nr.id, parsedNote: '',
          body: `Hello,\n\nACCO Engineered Systems requests dispatch for the following classification${cls.length > 1 ? 's' : ''} at ${form.siteName}:\n\n${cls.map((c) => `  • ${c.open} × ${c.title} (${c.code})`).join('\n')}\n\nStart: ${form.start || 'TBD'}\nSite contact: ${form.contactName} · ${form.contactPhone || ''}\n\nThe full labor request form is attached. Please reply to this thread with dispatch confirmations.\n\nRegards,\n${acctB.name}\nACCO — sent automatically from the onboarding platform`,
        };
      });
      addEmails(recs);
      nr.emailed = true;
      nr.pendBadge = 'Just sent';
      nr.pendNote = `${unionNames.map(unionShort).join(' · ')} · ${classes.length} classification${classes.length > 1 ? 's' : ''}`;
      nr.activity = [{ t: 'Sep 8, just now', label: `Auto-send enabled — ${unionNames.length} separate email${unionNames.length > 1 ? 's' : ''} sent (one per union), form attached, ${acctB.name} in Cc` }]
        .concat(nr.activity.filter((a) => !a.label.includes('Not yet emailed')));
    }
    addRequest(nr);
    if (mode === 'draft' && draftKey) removeDraft(draftKey as DraftKey);
    navigate(`/requests/${nr.id}`, { state: { justSubmitted: true } });
  };

  return (
    <div className="page-fill">
      <div className="page-bar" style={{ padding: '14px 40px' }}>
        <div className="col" style={{ gap: 2 }}>
          <h1 className="h1">{isEdit ? `Edit labor request ${id ?? ''}` : 'Labor request — draft'}</h1>
          <span className="sub">{isEdit ? 'Changes sync to the HCM labor records instantly — email the union again if the request changes' : 'Request ID assigned on submit · created instantly in HCM through the platform connection'}</span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={cancel}>Cancel</Button>
          <Button variant="outline" size="sm" onClick={saveDraft}>Save and close</Button>
          <Button variant="action" size="sm" iconLeft="send" disabled={!canSubmit} onClick={submit}>{isEdit ? 'Save changes' : 'Submit'}</Button>
        </div>
      </div>

      <div className="page">
        {mode === 'new' && (
          <div className="notice" style={{ padding: '8px 16px', flex: '0 0 auto' }}>
            <Icon name={lrx === 'busy' ? 'loader-2' : lrx === 'done' ? 'circle-check' : 'sparkles'} size={14} className={lrx === 'busy' ? 'spin' : undefined} style={{ color: 'var(--primary)' }} />
            <span>{lrx === 'busy' ? `Reading ${lrxFile} — extracting request details, job site and classifications…` : lrx === 'done' ? `Pre-filled from ${lrxFile} — review every field before submitting.` : 'Already have this request as a filled document?  We’ll extract the data and pre-fill the form.'}</span>
            {lrx === 'idle' && (
              <>
                <button type="button" className="btn-outline-xs ml-auto" style={{ fontSize: 12 }} onClick={() => fileRef.current?.click()}><Icon name="upload" size={13} style={{ color: 'var(--muted-foreground)' }} />Upload</button>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" style={{ display: 'none' }} onChange={(e) => { onLrxFile(e.target.files?.[0]); e.target.value = ''; }} />
              </>
            )}
            {lrx === 'done' && <button type="button" className="link-btn ml-auto" style={{ textDecoration: 'underline' }} onClick={lrxUndo}>Clear pre-fill</button>}
          </div>
        )}

        <Section n={1} title="Request details" right={
          <div className="row hint" style={{ gap: 16 }}>
            <span><strong style={{ color: 'var(--foreground)' }}>Created by</strong> {email}</span>
            <span><strong style={{ color: 'var(--foreground)' }}>Date created</strong> <span className="mono">9/7/26</span></span>
          </div>
        }>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px 24px', padding: '16px 24px' }}>
            <div className="field">
              <span className="label">Labor requestor<span className="req"> *</span></span>
              <div className="locked"><span>{form.requestor || acct.name}</span><span className="locked-tag"><Icon name="lock" size={10} />Signed-in user</span></div>
            </div>
            <div className="field">
              <span className="label">Onboarding specialist<span className="req"> *</span></span>
              <SelectMenu ariaLabel="Onboarding specialist" value={form.specialist} placeholder="Select…" options={[acct.name, 'Priya Raman']} onChange={(v) => set('specialist', v)} />
            </div>
            <div className="field">
              <span className="label">Hiring manager<span className="req"> *</span></span>
              <SelectMenu ariaLabel="Hiring manager" value={form.hm} placeholder="Select…" options={OPTS.hm} onChange={(v) => set('hm', v)} />
            </div>
            <div className="field">
              <label htmlFor="f-start" className="label">Start date and start time<span className="req"> *</span></label>
              <DateTimePicker id="f-start" withTime ariaLabel="Start date and start time" placeholder="MM/DD/YYYY · HH:MM" value={form.start} onChange={(v) => set('start', v)} />
            </div>
            <div className="field">
              <span className="label">Expiration<span className="req"> *</span></span>
              <div className="row" style={{ gap: 16, height: 32 }}>
                <label className="row" style={{ gap: 6, fontSize: 12, cursor: 'pointer' }}><input type="radio" name="exp" checked={form.expiration === 'until'} onChange={() => set('expiration', 'until')} style={{ accentColor: 'var(--primary)' }} />Until filled</label>
                <label className="row" style={{ gap: 6, fontSize: 12, cursor: 'pointer' }}><input type="radio" name="exp" checked={form.expiration === 'date'} onChange={() => set('expiration', 'date')} style={{ accentColor: 'var(--primary)' }} />On date</label>
              </div>
            </div>
            <div className="field">
              <span className="label">Supervisor</span>
              <SelectMenu ariaLabel="Supervisor" value={form.supervisor} placeholder="Select…" options={OPTS.supervisor} onChange={(v) => set('supervisor', v)} />
            </div>
            <div className="field">
              <span className="label">Department<span className="req"> *</span></span>
              <SelectMenu ariaLabel="Department" value={form.dept} placeholder="Select…" options={OPTS.dept} onChange={(v) => set('dept', v)} />
            </div>
            <div className="field">
              <span className="label">Location<span className="req"> *</span></span>
              <SelectMenu ariaLabel="Location" value={form.location} placeholder="Select…" options={OPTS.location} onChange={(v) => set('location', v)} />
            </div>
            <div className="field">
              <span className="label">Special requests</span>
              <input className="input" aria-label="Special requests" placeholder="None" value={form.special} onChange={(e) => set('special', e.target.value)} />
            </div>
          </div>
        </Section>

        <Section n={2} title="Job site & legal employer">
          <div className="two-col" style={{ gridTemplateColumns: '1.1fr 1fr', gap: '20px 32px', padding: '16px 24px' }}>
            <div className="col" style={{ gap: 16 }}>
              <div className="field">
                <label htmlFor="f-sitename" className="label">Job site name<span className="req"> *</span></label>
                <input id="f-sitename" className="input" placeholder="e.g. LAX Terminal 9 — Central Utility Plant" value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="f-siteaddr" className="label">Job site address<span className="req"> *</span></label>
                <textarea id="f-siteaddr" className="textarea" rows={3} placeholder={'Street\nCity, State ZIP'} value={form.siteAddress} onChange={(e) => set('siteAddress', e.target.value)} />
                <span className="hint">Street, city, state and ZIP — appears verbatim in the union email</span>
              </div>
              <div className="field">
                <label htmlFor="f-siteinstr" className="label">Additional job site instructions</label>
                <textarea id="f-siteinstr" className="textarea" rows={2} style={{ minHeight: 48, lineHeight: 1.5 }} placeholder="Badging, parking, PPE, check-in…" value={form.siteInstr} onChange={(e) => set('siteInstr', e.target.value)} />
              </div>
            </div>
            <div className="col" style={{ gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label htmlFor="f-cname" className="label">Contact name<span className="req"> *</span></label>
                  <input id="f-cname" className="input" placeholder="Site contact" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="f-cphone" className="label">Contact phone<span className="req"> *</span></label>
                  <input id="f-cphone" className="input mono" placeholder="(000) 000-0000" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="f-cemail" className="label">Contact email<span className="req"> *</span></label>
                <input id="f-cemail" type="email" className="input" placeholder="name@accoes.com" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
              </div>
              <div className="field">
                <span className="label">Legal employer<span className="req"> *</span></span>
                <SelectMenu ariaLabel="Legal employer" value={form.employer} placeholder="Select legal employer…" options={OPTS.employer} onChange={(v) => set('employer', v)} />
              </div>
              <div className="field">
                <span className="label">Business unit<span className="req"> *</span></span>
                <SelectMenu ariaLabel="Business unit" value={form.bu} placeholder="Select business unit…" options={OPTS.bu} onChange={(v) => set('bu', v)} />
              </div>
            </div>
          </div>
        </Section>

        <Section n={3} title="Classifications" sub="Bundle several trades into one request — one HCM record and one union email per row"
          actions={<Button variant="outline" size="xs" iconLeft="plus" onClick={() => setForm((f) => ({ ...f, classes: f.classes.concat({ ...EMPTY_CLASS }) }))}>Add classification</Button>}>
          <div className="col" style={{ gap: 12, padding: '16px 24px' }}>
            {form.classes.map((c, i) => (
              <ClassRow key={i} c={c} i={i} canRemove={form.classes.length > 1}
                onChange={(patch) => setCls(i, patch)}
                onRemove={() => setForm((f) => ({ ...f, classes: f.classes.filter((_, j) => j !== i) }))} />
            ))}
          </div>
          {SHOW_NEXT_STEP_GUIDANCE && (
            <div className="card-foot" style={{ padding: '10px 24px', borderRadius: '0 0 16px 16px' }}>
              <Icon name="info" size={14} style={{ color: 'var(--primary)' }} />
              <span className="sub">This request bundles {form.classes.length} classification{form.classes.length > 1 ? 's' : ''} — {totalNew} opening{totalNew > 1 ? 's' : ''}, one job site. On submit the labor records are created instantly in HCM; you then email the union from the request page. AI-suggested unions are confirmed by you before anything sends.</span>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function ClassRow({ c, i, canRemove, onChange, onRemove }: { c: FormClass; i: number; canRemove: boolean; onChange: (p: Partial<FormClass>) => void; onRemove: () => void }) {
  const [unionOpen, setUnionOpen] = useState(false);
  const heading = c.title ? `${c.trade.split(' · ')[0]} · ${c.title}` : `Classification ${i + 1}`;
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between', padding: '8px 16px', background: 'var(--ds-bg-gray-light)', borderBottom: '1px solid var(--border)', borderRadius: '12px 12px 0 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{heading}</span>
        <div className="row" style={{ gap: 8 }}>
          {c.done && <Pill tone="ok" icon="circle-check">Complete</Pill>}
          {!!(c.trade && c.union) && <Pill tone="ok" icon="circle-check">AI union match · high</Pill>}
          <IconButton icon="circle-check" label="Mark classification complete" size="sm" onClick={() => onChange({ done: !c.done })} />
          <IconButton icon="arrow-left-right" label="Transfer — pick another union" size="sm" onClick={() => setUnionOpen((o) => !o)} />
          {canRemove && <IconButton icon="trash-2" label="Remove classification" size="sm" onClick={onRemove} />}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.3fr 130px 1.6fr', gap: 16, padding: '12px 16px' }} className="cls-grid">
        <div className="field">
          <span className="label-sm">Trade code and trade *</span>
          <SelectMenu ariaLabel="Trade code and trade" value={c.trade} placeholder="Select trade code…" options={OPTS.trade} onChange={(v) => onChange({ trade: v })} />
        </div>
        <div className="field">
          <span className="label-sm">Trade level *</span>
          <SelectMenu ariaLabel="Trade level" value={c.level} placeholder="Level…" options={OPTS.level} onChange={(v) => onChange({ level: v })} />
        </div>
        <div className="field">
          <span className="label-sm">Business title *</span>
          <SelectMenu ariaLabel="Business title" value={c.title} placeholder="Title…" options={OPTS.title} onChange={(v) => onChange({ title: v })} />
        </div>
        <div className="field">
          <span className="label-sm">Openings *</span>
          <div className="row" style={{ justifyContent: 'space-between', gap: 10, height: 32, padding: '0 6px', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 12 }}>
            <button type="button" className="ghost-icon" aria-label="Fewer openings" style={{ width: 22, height: 22, padding: 0, justifyContent: 'center' }} onClick={() => onChange({ open: Math.max(1, c.open - 1) })}><Icon name="minus" size={12} /></button>
            <span className="mono" style={{ fontWeight: 600 }}>{c.open}</span>
            <button type="button" className="ghost-icon" aria-label="More openings" style={{ width: 22, height: 22, padding: 0, justifyContent: 'center' }} onClick={() => onChange({ open: c.open + 1 })}><Icon name="plus" size={12} /></button>
          </div>
        </div>
        <div className="field">
          <span className="label-sm">Union code &amp; description *</span>
          <UnionMultiSelect value={c.union} options={UNIONS} onChange={(v) => onChange({ union: v })} openExternal={unionOpen} onOpenChange={setUnionOpen} />
        </div>
      </div>
    </div>
  );
}
