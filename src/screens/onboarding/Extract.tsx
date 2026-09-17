import { Button, Icon } from '../../ds';
import { DOCDEFS } from '../../lib/data';
import { useOnboarding } from '../../store/onboarding';
import { Pill } from '../../components/Pill';
import { useObDerived } from './derived';
import { UploadActions } from './IdentityCheck';

export function Extract() {
  const d = useObDerived();
  const simUpload = useOnboarding((s) => s.simUpload);
  const bulkUpload = useOnboarding((s) => s.bulkUpload);
  const registerFile = useOnboarding((s) => s.registerFile);
  const fileUrls = useOnboarding((s) => s.fileUrls);
  const openDv = useOnboarding((s) => s.openDv);
  const setEdit = useOnboarding((s) => s.setEdit);
  const confirmProfile = useOnboarding((s) => s.confirmProfile);

  return (
    <div className="page ob-extract">
      <div className="card col">
        <div className="card-head" style={{ padding: '14px 16px' }}>
          <h3 className="h3">Documents</h3>
          <span className="mono hint">{d.readyCount} / 4 ready</span>
        </div>
        <div className="col" style={{ gap: 8, padding: 12, flex: 1 }}>
          <div className="row" style={{ gap: 10, padding: '10px 12px', border: '1.5px dashed var(--primary)', borderRadius: 10, background: 'var(--ds-bg-blue-light)' }}>
            <span className="round-icon" style={{ width: 30, height: 30, background: 'var(--card)', color: 'var(--primary)' }}><Icon name="file-stack" size={15} /></span>
            <div className="col flex-1" style={{ gap: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Drop all documents at once</span>
              <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>AI classifies each file into the right folder below — any order</span>
            </div>
            <label htmlFor="doc-file-all" className="chip-btn" style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}><Icon name="upload" size={11} />Upload files</label>
            <input id="doc-file-all" type="file" multiple accept="image/*,.pdf,.doc,.docx,.heic" style={{ display: 'none' }} onChange={(e) => { bulkUpload(Array.from(e.target.files || [])); e.target.value = ''; }} />
          </div>

          {DOCDEFS.map((def) => {
            const doc = d.docs[def.key];
            const border = doc.status === 'ready' ? 'var(--status-pre-approved)' : doc.status === 'error' ? 'var(--destructive)' : doc.status === 'uploading' || doc.status === 'scanning' ? 'var(--primary)' : 'var(--border)';
            const readySub = doc.files.length > 1 ? `${doc.files.length} documents read` : def.key === 'dispatch' && d.ctx.prefilled ? 'Received via union email' : 'Read successfully';
            return (
              <div key={def.key} className="col" style={{ gap: 8, padding: '10px 12px', border: `${doc.status === 'ready' ? 2 : 1}px solid ${border}`, borderRadius: 12, background: 'var(--card)', flex: '0 0 auto' }}>
                <div className="col" style={{ gap: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{def.title}{def.req && <span className="req" title="Required document"> *</span>}</span>
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{def.sub}</span>
                </div>
                <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                  {def.chips.map((c) => <span key={c} className="pill pill-muted" style={{ padding: '1px 7px', fontSize: 10, fontWeight: 500 }}>{c}</span>)}
                </div>

                {doc.status === 'ready' && (
                  <>
                    <div className="row" style={{ gap: 8 }}>
                      <Pill tone="ok" icon="circle-check" iconSize={11} xs>Ready</Pill>
                      <span className="hint truncate flex-1">{readySub}</span>
                      <button type="button" className="icon-btn s26" aria-label="Preview document" title="Preview" onClick={() => { const nm = doc.files[0]?.name || def.title; openDv({ name: nm, kind: def.key, url: fileUrls[nm] || '' }); }}><Icon name="eye" size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                      <button type="button" className="icon-btn s26" aria-label="Add another document" title="Add another document" onClick={() => simUpload(def.key, true)}><Icon name="plus" size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                      <button type="button" className="icon-btn s26" aria-label="Re-upload document" title="Re-upload" onClick={() => simUpload(def.key)}><Icon name="upload" size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                    </div>
                    {doc.files.length > 0 && (
                      <div className="col" style={{ gap: 3 }}>
                        {doc.files.map((fl, i) => (
                          <div key={`${fl.name}-${i}`} className="row" style={{ gap: 6 }}>
                            <Icon name="paperclip" size={11} style={{ color: 'var(--muted-foreground)' }} />
                            <span className="hint truncate">{fl.name}</span>
                            <span className="ml-auto mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{fl.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {doc.history && doc.history.length > 0 && (
                      <div className="col" style={{ gap: 3, paddingTop: 4, borderTop: '1px dashed var(--border)' }}>
                        <span className="overline-xs">History</span>
                        {doc.history.map((hs, i) => (
                          <div key={`${hs.name}-${i}`} className="row" style={{ gap: 6 }}>
                            <Icon name="history" size={11} style={{ color: 'var(--muted-foreground)' }} />
                            <span className="hint truncate" style={{ textDecoration: 'line-through' }}>{hs.name}</span>
                            <span className="ml-auto" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>replaced · {hs.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {doc.status === 'uploading' && (
                  <div className="col" style={{ gap: 5 }}>
                    <div className="progress"><div style={{ width: `${doc.pct}%` }} /></div>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <Pill tone="navy" icon="upload" iconSize={11} xs>Uploading</Pill>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{doc.pct}%</span>
                    </div>
                  </div>
                )}
                {doc.status === 'scanning' && (
                  <div className="col" style={{ gap: 5 }}>
                    <div className="progress"><div style={{ width: '100%', opacity: .5 }} /></div>
                    <div className="row" style={{ gap: 6 }}><Icon name="loader-2" size={12} className="spin" style={{ color: 'var(--primary)' }} /><span className="hint">Scanning — verifying type &amp; reading details</span></div>
                  </div>
                )}
                {doc.status === 'error' && (
                  <div className="row" style={{ gap: 8 }}>
                    <Pill tone="bad" icon="circle-x" iconSize={11} xs>Document error</Pill>
                    <span className="hint flex-1">File unreadable — try again</span>
                    <button type="button" className="btn-danger-outline" style={{ height: 24, padding: '0 8px', fontSize: 11, gap: 4 }} onClick={() => simUpload(def.key)}><Icon name="upload" size={11} />Re-upload</button>
                  </div>
                )}
                {doc.status === 'empty' && (
                  <div className="dropzone">
                    <span className="round-icon" style={{ width: 30, height: 30, background: 'var(--muted)', color: 'var(--muted-foreground)' }}><Icon name="upload" size={15} /></span>
                    <span className="hint">Drag &amp; drop the document, or</span>
                    <UploadActions fileId={`doc-file-${def.key}`} onFile={(f) => { registerFile(f); simUpload(def.key, false, f.name); }} onSim={() => simUpload(def.key)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="card-foot" style={{ padding: '10px 16px' }}><span className="hint" style={{ lineHeight: 1.5 }}>PNG, JPEG, PDF, DOC, DOCX, HEIC · ≤10 MB per file.</span></div>
      </div>

      <div className="card col">
        <div className="card-head">
          <h3 className="h3">Extracted data</h3>
          <Button variant="action" size="sm" iconRight="arrow-right" disabled={d.confirmDisabled} onClick={confirmProfile}>Confirm &amp; create profile</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 16px', padding: '14px 20px' }}>
          {d.xfields.map((f) => (
            <div key={f.k} className="field">
              <span className="label">{f.k}{f.req && <span className="req" title="Mandatory field"> *</span>}</span>
              {f.has ? (
                <>
                  <input className="input" aria-label={f.k} value={f.v} onChange={(e) => setEdit(f.k, e.target.value)} />
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>From {f.srcLabel} — select to edit</span>
                </>
              ) : (
                <div className="row" style={{ height: 32, padding: '0 12px', border: '1px dashed var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--muted-foreground)', background: 'var(--muted)' }}>Awaiting {f.srcLabel}</div>
              )}
            </div>
          ))}
        </div>
        <div className="card-foot" style={{ marginTop: 'auto', padding: '12px 20px' }}>
          <Icon name="sparkles" size={14} style={{ color: 'var(--primary)' }} />
          <span className="sub">Fields fill in as each document is read and stay editable — select any value to correct it. Confirm enables once every mandatory document is ready.</span>
        </div>
      </div>
    </div>
  );
}
