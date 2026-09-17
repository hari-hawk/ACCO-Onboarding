import { Avatar, Button, Icon } from '../../ds';
import { DEMO_PIN } from '../../lib/data';
import { useApp } from '../../store/app';
import { useOnboarding } from '../../store/onboarding';
import { Modal, Scrim } from '../../components/Modal';
import { Skel, SkelLines, SignatureLine } from '../../components/Paper';
import { stop } from '../../lib/utils';
import { useObDerived } from './derived';

/* ── Identity-check verdict ──────────────────────────────────────────── */
const VERDICT = {
  new: { icon: 'circle-check', bg: 'var(--status-pre-approved-bg)', fg: 'var(--status-pre-approved)', title: 'New hire — no existing HCM record', body: 'No existing record and no flags. Proceed with document upload, extraction and profile creation.', cta: 'Continue to documents' },
  rehire: { icon: 'triangle-alert', bg: 'var(--status-review-required-bg)', fg: 'var(--status-review-required)', title: 'Rehire — record on file', body: 'HCM found a prior worker record for this identity. Continue with the pre-filled documents and field data — only what changed needs re-capture.', cta: 'Continue with pre-filled record' },
  dnh: { icon: 'circle-x', bg: 'var(--status-action-mandatory-bg)', fg: 'var(--status-action-mandatory)', title: 'Do Not Hire — blocked', body: 'HCM returned a Do Not Hire flag for this identity. This record does not proceed — no override here; HR resolves the flag in HCM.', cta: '' },
  noverify: { icon: 'info', bg: 'var(--ds-bg-blue-light)', fg: 'var(--primary)', title: 'Identity could not be auto-verified', body: 'No confident match in HCM. Proceed to document extraction — the SSN card read will re-run the check automatically.', cta: 'Continue to documents' },
} as const;

export function PreResult() {
  const result = useOnboarding((s) => s.preResult);
  const pre = useOnboarding((s) => s.pre);
  const close = useOnboarding((s) => s.closePreResult);
  const cont = useOnboarding((s) => s.continueFromPrecheck);
  if (!result) return null;
  const v = VERDICT[result];
  const name = `${pre.first} ${pre.last}`.trim();
  return (
    <Scrim zIndex={620} style={{ background: 'rgba(20,26,38,.6)' }}>
      <Modal width={440} label="Identity check result" style={{ padding: 28, alignItems: 'center', gap: 12, textAlign: 'center' }}>
        <span className="round-icon" style={{ width: 44, height: 44, background: v.bg, color: v.fg }}><Icon name={v.icon} size={22} /></span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{v.title}</span>
        <span className="sub" style={{ lineHeight: 1.6 }}>{v.body}</span>
        {result === 'rehire' && (
          <div className="row" style={{ gap: 10, width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--background)', textAlign: 'left' }}>
            <Avatar name={name} size="sm" style={{ width: 28, height: 28 }} />
            <div className="col flex-1" style={{ gap: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
              <span className="hint">Prior clock <span className="mono" style={{ fontWeight: 600 }}>512446</span> · documents &amp; profile on file</span>
            </div>
          </div>
        )}
        <div className="row" style={{ gap: 8 }}>
          {result === 'dnh'
            ? <Button variant="outline" size="sm" onClick={close}>Close — do not proceed</Button>
            : <><Button variant="ghost" size="sm" onClick={close}>Back</Button><Button variant="action" size="sm" iconRight="arrow-right" onClick={cont}>{v.cta}</Button></>}
        </div>
      </Modal>
    </Scrim>
  );
}

/* ── Verification PIN ────────────────────────────────────────────────── */
export function PinDialog() {
  const open = useOnboarding((s) => s.pinOpen);
  const pinFor = useOnboarding((s) => s.pinFor);
  const val = useOnboarding((s) => s.pinVal);
  const err = useOnboarding((s) => s.pinErr);
  const setVal = useOnboarding((s) => s.setPinVal);
  const close = useOnboarding((s) => s.closePin);
  const verify = useOnboarding((s) => s.verifyPin);
  const expected = useApp((s) => s.pin);
  if (!open) return null;
  return (
    <Scrim onClose={close} zIndex={620}>
      <Modal width={400} label="Verification PIN">
        <div className="col" style={{ gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{pinFor === 'file' ? 'Verify to file the signed packet' : 'Verify to submit the profile to HCM'}</span>
          <span className="sub" style={{ lineHeight: 1.5 }}>Human-in-the-loop check — enter your 6-digit verification PIN to authorize. Manage or regenerate it from your account menu.</span>
        </div>
        <input className="input mono" aria-label="6-digit PIN" inputMode="numeric" maxLength={6} placeholder="••••••" value={val} onChange={(e) => setVal(e.target.value)}
          style={{ height: 48, padding: '0 16px', borderColor: err ? 'var(--destructive)' : undefined, borderRadius: 10, fontSize: 24, fontWeight: 700, letterSpacing: '.5em', textAlign: 'center' }} />
        {err && <span className="row" style={{ gap: 4, fontSize: 11, color: 'var(--destructive)', fontWeight: 500 }}><Icon name="circle-x" size={12} />PIN does not match — try again or regenerate from your account menu.</span>}
        <span className="hint">Demo PIN: <span className="mono" style={{ fontWeight: 600 }}>{expected === DEMO_PIN ? DEMO_PIN : expected}</span></span>
        <div className="modal-actions">
          <Button variant="ghost" size="sm" onClick={close}>Cancel</Button>
          <Button variant="action" size="sm" iconLeft="shield-check" disabled={val.length !== 6} onClick={() => verify(expected)}>Verify &amp; submit</Button>
        </div>
      </Modal>
    </Scrim>
  );
}

/* ── HCM round-trip ──────────────────────────────────────────────────── */
export function HcmBusy() {
  const busy = useOnboarding((s) => s.hcmBusy);
  const which = useOnboarding((s) => s.hcmBusyFor);
  if (!busy) return null;
  const label = which === 'file' ? 'Filing signed packet into HCM Documents of Record…' : which === 'precheck' ? 'Checking identity against Oracle Fusion HCM…' : 'Creating pending worker in Oracle Fusion HCM…';
  return (
    <Scrim zIndex={620}>
      <Modal width={360} label="Contacting HCM" style={{ padding: 32, alignItems: 'center', gap: 12 }}>
        <Icon name="loader-2" size={24} className="spin" style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span className="hint" style={{ textAlign: 'center' }}>Oracle Fusion HCM responds within a few seconds over the interconnect API.</span>
      </Modal>
    </Scrim>
  );
}

/* ── Document viewer ─────────────────────────────────────────────────── */
export function DocViewer() {
  const dv = useOnboarding((s) => s.dv);
  const ctx = useOnboarding((s) => s.ctx);
  const close = useOnboarding((s) => s.closeDv);
  const patch = useOnboarding((s) => s.dvPatch);
  const d = useObDerived();
  if (!dv.open) return null;
  const name = dv.name || ctx.doc || 'document.pdf';
  const isDispatch = !dv.url && dv.kind === 'dispatch';
  const generic = !dv.url && dv.kind !== 'dispatch';
  const NavBtn = ({ label, icon, onClick, size = 15 }: { label: string; icon: string; onClick?: () => void; size?: number }) => (
    <button type="button" className="nav-icon-btn" aria-label={label} onClick={onClick}><Icon name={icon} size={size} /></button>
  );
  return (
    <Scrim dark onClose={close} zIndex={600}>
      <div className="viewer-bar" role="dialog" aria-modal="true" aria-label="Document preview" onClick={stop} style={{ flex: '0 0 auto' }}>
        <Icon name="file-text" size={15} style={{ color: 'rgba(255,255,255,.75)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.75)' }}>Page {dv.page} of 2</span>
        <div className="row ml-auto" style={{ gap: 4 }}>
          <NavBtn label="Zoom out" icon="zoom-out" onClick={() => patch({ zoom: Math.max(0.5, dv.zoom - 0.25) })} />
          <span className="mono" style={{ fontSize: 11, fontWeight: 600, minWidth: 42, textAlign: 'center' }}>{Math.round(dv.zoom * 100)}%</span>
          <NavBtn label="Zoom in" icon="zoom-in" onClick={() => patch({ zoom: Math.min(2, dv.zoom + 0.25) })} />
          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,.25)', margin: '0 6px' }} />
          <NavBtn label="Rotate page" icon="rotate-cw" onClick={() => patch({ rot: (dv.rot + 90) % 360 })} />
          <NavBtn label="Download document" icon="download" />
          <NavBtn label="Open in new window" icon="external-link" />
          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,.25)', margin: '0 6px' }} />
          <NavBtn label="Close preview" icon="x" size={16} onClick={close} />
        </div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '120px 1fr', minHeight: 0 }}>
        <div className="col" style={{ gap: 10, padding: '16px 12px', background: 'rgba(20,26,38,.5)', overflow: 'auto' }} onClick={stop}>
          {([1, 2] as const).map((n) => (
            <button key={n} type="button" aria-label={`Go to page ${n}`} className="col" style={{ alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} onClick={() => patch({ page: n })}>
              <span className="col" style={{ gap: 3, width: 72, height: 94, background: '#fff', border: `2px solid ${dv.page === n ? 'var(--accent-gold)' : 'transparent'}`, borderRadius: 4, padding: '8px 7px', boxSizing: 'border-box', overflow: 'hidden' }}>
                <Skel w="60%" h={5} bg="#C9CFD8" /><Skel w="90%" h={3} bg="#E3E7EC" /><Skel w="84%" h={3} bg="#E3E7EC" /><Skel w="88%" h={3} bg="#E3E7EC" /><Skel w="70%" h={3} bg="#E3E7EC" /><Skel w="86%" h={3} bg="#E3E7EC" style={{ marginTop: 'auto' }} />
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: dv.page === n ? '#fff' : 'rgba(255,255,255,.6)' }}>{n}</span>
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 24 }}>
          <button type="button" aria-label="Previous page" disabled={dv.page <= 1} onClick={(e) => { e.stopPropagation(); if (dv.page > 1) patch({ page: 1 }); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: 'none', borderRadius: 999, background: 'rgba(255,255,255,.9)', cursor: 'pointer', boxShadow: 'var(--elev-3)', opacity: dv.page <= 1 ? .4 : 1 }}><Icon name="chevron-left" size={18} /></button>
          <div className="paper" onClick={stop} style={{ width: 470, height: 608, flex: '0 0 auto', transform: `scale(${dv.zoom}) rotate(${dv.rot}deg)`, transition: 'transform 150ms var(--ease-standard)', padding: '36px 40px' }}>
            {dv.url && (
              <>
                <span role="img" aria-label="Uploaded document" style={{ flex: 1, backgroundImage: `url(${dv.url})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
                <span style={{ fontSize: 10, color: '#6B7280', textAlign: 'center' }}>{name} — as uploaded</span>
              </>
            )}
            {generic && (
              <div className="col" style={{ flex: 1, gap: 14, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 4, padding: 24, filter: 'contrast(.95)' }}>
                <div className="row" style={{ gap: 14, alignItems: 'stretch' }}>
                  <span className="round-icon" style={{ width: 90, height: 110, background: '#D1D5DB', borderRadius: 4, color: '#9CA3AF' }}><Icon name="user" size={36} /></span>
                  <div className="col flex-1" style={{ gap: 8, justifyContent: 'center' }}>
                    <Skel w="70%" h={6} bg="#C9CFD8" /><Skel w="55%" h={5} bg="#D8DDE4" /><Skel w="62%" h={5} bg="#D8DDE4" /><Skel w="40%" h={5} bg="#D8DDE4" />
                  </div>
                </div>
                <SkelLines widths={['92%', '84%', '88%', '58%']} bg="#DDE1E7" style={{ marginTop: 6 }} />
                <span style={{ marginTop: 'auto', fontSize: 10, color: '#6B7280', textAlign: 'center' }}>{name} — scanned photocopy, shown to validate the right document was uploaded</span>
              </div>
            )}
            {isDispatch && dv.page === 1 && (
              <>
                <div className="row" style={{ justifyContent: 'space-between', borderBottom: '2px solid #1F2937', paddingBottom: 10 }}>
                  <div className="col"><span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.02em', color: '#1F2937' }}>{d.union}</span><span style={{ fontSize: 9, color: '#6B7280' }}>Dispatch Office · Southern California jurisdiction</span></div>
                  <span className="round-icon" style={{ width: 34, height: 34, border: '2px solid #1F2937', fontSize: 9, fontWeight: 700, color: '#1F2937' }}>UA</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '.08em', color: '#1F2937', textAlign: 'center' }}>UNION DISPATCH SLIP</span>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px 12px', fontSize: 10, color: '#374151' }}>
                  <span style={{ fontWeight: 700 }}>Dispatch No.</span><span className="mono">D-44182</span>
                  <span style={{ fontWeight: 700 }}>Member name</span><span>{d.name}</span>
                  <span style={{ fontWeight: 700 }}>Classification</span><span>{d.cls}</span>
                  <span style={{ fontWeight: 700 }}>Contractor</span><span>ACCO Engineered Systems, Inc.</span>
                  <span style={{ fontWeight: 700 }}>Job site</span><span>{d.site}</span>
                  <span style={{ fontWeight: 700 }}>Report date</span><span>{d.start}</span>
                  <span style={{ fontWeight: 700 }}>Wage group</span><span>Group 1 — current master agreement</span>
                </div>
                <div className="col" style={{ border: '1px solid #D1D5DB', borderRadius: 4, padding: '10px 12px', gap: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', letterSpacing: '.06em' }}>DISPATCHER REMARKS</span>
                  <Skel w="92%" /><Skel w="74%" />
                </div>
                <div className="row" style={{ marginTop: 'auto', justifyContent: 'space-between', gap: 24 }}><SignatureLine label="Dispatcher signature" flex /><SignatureLine label="Date issued" flex /></div>
              </>
            )}
            {isDispatch && dv.page === 2 && (
              <>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#1F2937' }}>TERMS OF DISPATCH</span>
                <SkelLines widths={['96%', '90%', '94%', '68%']} />
                <SkelLines widths={['92%', '88%', '75%']} style={{ marginTop: 1 }} />
                <SkelLines widths={['91%', '85%', '60%']} style={{ marginTop: 1 }} />
                <div className="col" style={{ gap: 8, marginTop: 6 }}>
                  <div className="row" style={{ gap: 8 }}><span style={{ width: 10, height: 10, border: '1.5px solid #6B7280', borderRadius: 2 }} /><Skel w="60%" /></div>
                  <div className="row" style={{ gap: 8 }}><span style={{ width: 10, height: 10, border: '1.5px solid #6B7280', borderRadius: 2 }} /><Skel w="52%" /></div>
                </div>
                <div className="row" style={{ marginTop: 'auto', justifyContent: 'space-between', gap: 24 }}><SignatureLine label="Member signature" flex /><SignatureLine label="Date" flex /></div>
              </>
            )}
          </div>
          <button type="button" aria-label="Next page" disabled={dv.page >= 2} onClick={(e) => { e.stopPropagation(); if (dv.page < 2) patch({ page: 2 }); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: 'none', borderRadius: 999, background: 'rgba(255,255,255,.9)', cursor: 'pointer', boxShadow: 'var(--elev-3)', opacity: dv.page >= 2 ? .4 : 1 }}><Icon name="chevron-right" size={18} /></button>
        </div>
      </div>
    </Scrim>
  );
}
