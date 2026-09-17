import { Button, Icon } from '../../ds';
import { PRE_SAMPLES } from '../../lib/data';
import { useOnboarding, type PreDocKey } from '../../store/onboarding';
import { Pill } from '../../components/Pill';

const SLOTS: { key: PreDocKey; title: string; sub: string }[] = [
  { key: 'id', title: 'Photo ID / passport', sub: 'Photo and legal name are captured from the document' },
  { key: 'ssn', title: 'Social Security card', sub: 'SSN is read automatically' },
];

export function UploadActions({ fileId, onFile, onSim }: { fileId: string; onFile: (f: File) => void; onSim: () => void }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      <label htmlFor={fileId} className="chip-btn"><Icon name="upload" size={11} />Upload</label>
      <input id={fileId} type="file" accept="image/*,.pdf,.doc,.docx,.heic" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      <button type="button" className="chip-btn" onClick={onSim}><Icon name="scan" size={11} />Scan</button>
      <button type="button" className="chip-btn" onClick={onSim}><Icon name="camera" size={11} />Capture</button>
    </div>
  );
}

export function IdentityCheck() {
  const pre = useOnboarding((s) => s.pre);
  const setPre = useOnboarding((s) => s.setPre);
  const preDocs = useOnboarding((s) => s.preDocs);
  const preUpload = useOnboarding((s) => s.preUpload);
  const registerFile = useOnboarding((s) => s.registerFile);
  const fileUrls = useOnboarding((s) => s.fileUrls);
  const openDv = useOnboarding((s) => s.openDv);
  const checkIdentity = useOnboarding((s) => s.checkIdentity);
  const fillPre = useOnboarding((s) => s.fillPre);
  const incomplete = !(pre.first.trim() && pre.last.trim() && pre.ssn.trim() && pre.dob.trim());

  return (
    <div className="page" style={{ gap: 12 }}>
      <div className="col" style={{ gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 'var(--ls-tight)' }}>Identity check — before any documents</span>
        <span className="sub">Enter the tradesman's legal identity. HCM confirms instantly whether this is a new hire, a rehire with a record on file, or a Do Not Hire.</span>
      </div>
      <div className="card">
        <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px 16px', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          {SLOTS.map((def) => {
            const d = preDocs[def.key];
            const border = d.status === 'ready' ? 'var(--status-pre-approved)' : d.status === 'uploading' ? 'var(--primary)' : 'var(--border)';
            return (
              <div key={def.key} className="col" style={{ gap: 8, padding: '10px 12px', border: `${d.status === 'ready' ? 2 : 1}px solid ${border}`, borderRadius: 12 }}>
                <div className="col" style={{ gap: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{def.title}<span className="req" title="Required"> *</span></span>
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{def.sub}</span>
                </div>
                {d.status === 'empty' && (
                  <div className="dropzone">
                    <span className="round-icon" style={{ width: 30, height: 30, background: 'var(--muted)', color: 'var(--muted-foreground)' }}><Icon name="upload" size={15} /></span>
                    <span className="hint">Drag &amp; drop the document, or</span>
                    <UploadActions fileId={`pre-file-${def.key}`} onFile={(f) => { registerFile(f); preUpload(def.key, f.name); }} onSim={() => preUpload(def.key)} />
                  </div>
                )}
                {d.status === 'uploading' && (
                  <div className="col" style={{ gap: 5 }}>
                    <div className="progress"><div style={{ width: `${d.pct}%` }} /></div>
                    <div className="row" style={{ gap: 6 }}><Icon name="loader-2" size={12} className="spin" style={{ color: 'var(--primary)' }} /><span className="hint">Reading — name and details pre-fill below</span></div>
                  </div>
                )}
                {d.status === 'ready' && (
                  <div className="row" style={{ gap: 8 }}>
                    <Pill tone="ok" icon="circle-check" iconSize={11} xs>Ready</Pill>
                    <span className="hint truncate flex-1">{d.file} · fields pre-filled below</span>
                    <button type="button" className="icon-btn s26" aria-label="Preview document" title="Preview" onClick={() => openDv({ name: d.file || def.title, kind: `pre-${def.key}`, url: fileUrls[d.file] || '' })}><Icon name="eye" size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                    <button type="button" className="icon-btn s26" aria-label="Re-upload" title="Re-upload" onClick={() => preUpload(def.key)}><Icon name="upload" size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 16px', padding: '16px 24px' }}>
          <div className="field"><label htmlFor="pre-first" className="label">Legal first name<span className="req"> *</span></label><input id="pre-first" className="input" placeholder="First name" value={pre.first} onChange={(e) => setPre('first', e.target.value)} /></div>
          <div className="field"><label htmlFor="pre-last" className="label">Legal last name<span className="req"> *</span></label><input id="pre-last" className="input" placeholder="Last name" value={pre.last} onChange={(e) => setPre('last', e.target.value)} /></div>
          <div className="field"><label htmlFor="pre-ssn" className="label">SSN<span className="req"> *</span></label><input id="pre-ssn" className="input mono" placeholder="•••-••-••••" value={pre.ssn} onChange={(e) => setPre('ssn', e.target.value)} /></div>
          <div className="field date-field">
            <label htmlFor="pre-dob" className="label">Date of birth<span className="req"> *</span></label>
            <input id="pre-dob" className="input mono" placeholder="MM/DD/YYYY" value={pre.dob} onChange={(e) => setPre('dob', e.target.value)} />
            <input type="date" aria-label="Pick date of birth from calendar" title="Pick from calendar" onChange={(e) => { const v = e.target.value; if (!v) return; const [y, m, dd] = v.split('-'); setPre('dob', `${m}/${dd}/${y}`); }} />
            <Icon name="calendar" size={14} />
          </div>
        </div>
        <div className="card-foot" style={{ padding: '12px 24px' }}>
          <span className="hint">Checked against Oracle Fusion HCM the moment you submit — nothing is stored until a verdict returns.</span>
          <div className="ml-auto"><Button variant="action" size="sm" iconLeft="scan-search" disabled={incomplete} onClick={checkIdentity}>Check identity in HCM</Button></div>
        </div>
      </div>
      <div className="card col" style={{ padding: '14px 24px', gap: 10 }}>
        <span className="overline">Sample records — the check branches the flow</span>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {PRE_SAMPLES.map((p) => (
            <button key={p.name} type="button" className="btn-outline-xs" style={{ height: 'auto', padding: '8px 12px', borderRadius: 10, gap: 8, fontWeight: 400 }} onClick={() => fillPre(p.f)}>
              <Pill tone={p.tone} icon={p.bIcon} iconSize={11} xs>{p.badge}</Pill>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
              <span className="hint">{p.note}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
