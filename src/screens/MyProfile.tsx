import { useOutletContext } from 'react-router-dom';
import { Button, Icon } from '../ds';
import { useAccount, useActiveEmail, useApp } from '../store/app';
import { SettingRow } from '../components/Switch';
import type { ShellContext } from '../components/AppShell';

function ReadField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="field-sm">
      <span className="label-sm">{label}</span>
      <div className={`locked${mono ? ' mono' : ''}`} style={{ justifyContent: 'flex-start' }}>{value}</div>
    </div>
  );
}

export function MyProfile() {
  const acct = useAccount()!;
  const email = useActiveEmail();
  const key = useApp((s) => s.account)!;
  const autoSend = useApp((s) => s.autoSend[key]);
  const digest = useApp((s) => s.digest[key]);
  const toggleAutoSend = useApp((s) => s.toggleAutoSend);
  const toggleDigest = useApp((s) => s.toggleDigest);
  const { openPinMgr } = useOutletContext<ShellContext>();
  const isSpecialist = key === 'dana';
  const [first, ...rest] = acct.name.split(' ');

  return (
    <div className="page">
      <h1 className="h1">My profile</h1>
      <div className="card">
        <div className="row" style={{ gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <span className="round-icon" style={{ position: 'relative', width: 64, height: 64, background: 'var(--nav)', color: '#fff', fontSize: 20, fontWeight: 700, overflow: 'visible' }}>
            {acct.photo ? (
              <span style={{ position: 'absolute', inset: 0, borderRadius: 999, overflow: 'hidden', display: 'inline-flex', border: '1px solid var(--border)' }}>
                <img src={acct.photo} alt="Profile photo" style={{ width: '100%', height: '100%', objectFit: 'cover', background: acct.photoBg || 'var(--muted)', padding: '8%', boxSizing: 'border-box' }} />
              </span>
            ) : acct.initials}
            <span title="Change photo" className="round-icon" style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, background: 'var(--card)', border: '1px solid var(--border-strong)', cursor: 'pointer', zIndex: 2 }}>
              <Icon name="camera" size={12} style={{ color: 'var(--muted-foreground)' }} />
            </span>
          </span>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{acct.name}</span>
            <span className="sub">{acct.role} · from Entra ID groups</span>
            <span className="sub mono">{email}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px 16px', padding: '16px 24px' }}>
          <ReadField label="First name" value={first} />
          <ReadField label="Last name" value={rest.join(' ')} />
          <ReadField label="Role" value={acct.role} />
          <ReadField label="Employee ID" value="ACC-20481" mono />
          <ReadField label="Business unit" value="210 — Plumbing & Process Piping" />
          <ReadField label="Office" value="Glendale, CA — HQ" />
        </div>
        <div className="card-foot" style={{ padding: '10px 24px' }}>
          <Icon name="lock" size={13} style={{ color: 'var(--muted-foreground)' }} />
          <span className="hint">Identity fields come from Active Directory — edits happen there, not here.</span>
        </div>
      </div>

      <div className="card">
        <div className="card-head card-head-sm" style={{ padding: '12px 24px' }}><h3 className="h3">Access &amp; permissions</h3></div>
        {!isSpecialist && (
          <>
            <SettingRow on={autoSend} onToggle={toggleAutoSend} label="Allow automatic email sending" title="Allow automatic email sending"
              body="When enabled, submitting a labor request sends the union notification automatically from onboarding-specialists@accoes.com — one separate email per union, the request form attached, you in Cc. You can still copy the generated content for a manual send." />
            <SettingRow divider on={digest} onToggle={toggleDigest} label="Email reminders for pending items" title="Email reminders for pending items"
              body="When a labor request or union email sits unactioned for 1–2 days, the system emails you a reminder with the pending item and the action needed. Also covers system updates and newsletters — disable any time." />
          </>
        )}
        {isSpecialist && (
          <div className="row" style={{ gap: 14, padding: '14px 24px' }}>
            <span className="round-icon" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ds-bg-blue-light)', color: 'var(--primary)' }}><Icon name="shield-check" size={17} /></span>
            <div className="col flex-1" style={{ gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Verification PIN — HCM submissions</span>
              <span className="hint" style={{ lineHeight: 1.5 }}>Your 6-digit PIN confirms profile creation and packet filing. Regenerate it any time — a new two-factor request with your Microsoft account issues a fresh PIN automatically.</span>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <span className="mono" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '.3em' }}>••••••</span>
              <Button variant="outline" size="sm" iconLeft="rotate-cw" onClick={openPinMgr}>Regenerate PIN</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
