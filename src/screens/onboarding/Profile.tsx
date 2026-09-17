import { Button, Icon } from '../../ds';
import { DOCDEFS } from '../../lib/data';
import { useOnboarding } from '../../store/onboarding';
import { useObDerived } from './derived';

export function Profile() {
  const d = useObDerived();
  const clock = useOnboarding((s) => s.clock);
  const setStage = useOnboarding((s) => s.setStage);
  const goSign = useOnboarding((s) => s.goSign);
  const openPin = useOnboarding((s) => s.openPin);
  const openDv = useOnboarding((s) => s.openDv);
  const fileUrls = useOnboarding((s) => s.fileUrls);
  const sourceDocs = DOCDEFS.filter((def) => d.docReady(def.key)).map((def) => ({ def, name: d.docs[def.key].files[0]?.name || def.title }));

  return (
    <div className="page" style={{ gap: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div className="col" style={{ gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 'var(--ls-tight)' }}>HCM profile — {d.title}</span>
          <span className="sub">One record carries every extracted field through Profile, Forms &amp; sign and File to HCM — nothing is re-entered.</span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Button variant="outline" size="sm" iconLeft="chevron-left" onClick={() => setStage('extract')}>Back to documents</Button>
          {!clock
            ? <Button variant="action" size="sm" iconLeft="send" onClick={() => openPin('profile')}>Submit to HCM</Button>
            : <Button variant="action" size="sm" iconRight="arrow-right" onClick={goSign}>Continue to packet forms</Button>}
        </div>
      </div>

      {!clock ? (
        <div className="notice" style={{ border: '1px solid var(--primary)' }}>
          <Icon name="shield-check" size={14} style={{ color: 'var(--primary)' }} />
          <span>Human-in-the-loop: submitting asks for your verification PIN, then Oracle Fusion HCM verifies the identity over the interconnect API within seconds — new hire, existing worker or Do Not Hire.</span>
        </div>
      ) : (
        <div className="row" style={{ gap: 12, padding: '12px 16px', background: 'var(--status-pre-approved-bg)', border: '1px solid var(--status-pre-approved)', borderRadius: 12, flexWrap: 'wrap' }}>
          <Icon name="circle-check" size={16} style={{ color: 'var(--status-pre-approved)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-pre-approved)', flex: 1 }}>Profile created in HCM — pending worker. Auto-populated into every packet form; the worker never types it.</span>
          <div className="row" style={{ gap: 10, padding: '6px 14px', background: 'var(--card)', border: '1px solid var(--status-pre-approved)', borderRadius: 10 }}>
            <span className="overline-xs">Clock / person number</span>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-pre-approved)' }}>{clock}</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head card-head-xs" style={{ padding: '10px 24px' }}>
          <h3 className="h3">Onboarding record — pre-filled from documents</h3>
          <span className="hint">Edit any value back on the documents step</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px 20px', padding: '14px 24px' }}>
          {d.recFields.map((f) => (
            <div key={f.k} className="col" style={{ gap: 2 }}>
              <span className="label-sm">{f.k}</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{f.v}</span>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 10, padding: '12px 24px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <span className="overline">Source documents</span>
          {sourceDocs.map(({ def, name }) => (
            <button key={def.key} type="button" title="Preview document" className="btn-outline-xs" style={{ height: 'auto', padding: '6px 10px', gap: 8, fontWeight: 500 }}
              onClick={() => openDv({ name, kind: def.key, url: fileUrls[name] || '' })}>
              <Icon name="file-text" size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: 12 }}>{def.title}</span>
              <span className="hint">{name}</span>
              <Icon name="eye" size={13} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
