import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../../ds';
import { FILED_CHIPS, FILED_RETURN_SECONDS } from '../../lib/data';
import { landingFor, useApp } from '../../store/app';
import { useOnboarding } from '../../store/onboarding';
import { useObDerived } from './derived';

export function Filed() {
  const navigate = useNavigate();
  const key = useApp((s) => s.account)!;
  const d = useObDerived();
  const clock = useOnboarding((s) => s.clock) || '';
  const startNew = useOnboarding((s) => s.startNew);
  const [left, setLeft] = useState(FILED_RETURN_SECONDS);
  const home = landingFor(key);
  const homeLabel = key === 'dana' ? 'Onboardings' : 'Dashboard';

  /* Auto-return to the page the session came from; unmounting (Start another) cancels it. */
  useEffect(() => {
    const t = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (left === 0) navigate(home); }, [left, home, navigate]);

  return (
    <div className="page">
      <div className="card col" style={{ alignItems: 'center', gap: 14, padding: '44px 48px', textAlign: 'center' }}>
        <span className="round-icon" style={{ width: 56, height: 56, background: 'var(--status-pre-approved-bg)', color: 'var(--status-pre-approved)' }}><Icon name="circle-check" size={30} /></span>
        <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: 'var(--ls-tight)' }}>Onboarding complete — {d.title}</span>
        <span style={{ fontSize: 13, color: 'var(--muted-foreground)', maxWidth: 520, lineHeight: 1.6 }}>The signed packet was filed into HCM Documents of Record against this worker — no Box, no re-keying.</span>
        <span className="pill pill-navy mono" role="timer" aria-live="polite" style={{ padding: '3px 10px', fontSize: 12 }}>
          <Icon name="timer" size={12} />
          Returning to {homeLabel} in {left}s
        </span>
        <div className="row" style={{ gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="col" style={{ alignItems: 'center', gap: 4, padding: '14px 28px', background: 'var(--card)', border: '1px solid var(--border-strong)', borderRadius: 12 }}>
            <span className="overline-xs">Clock / person no.</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{clock}</span>
          </div>
          <div className="col" style={{ alignItems: 'center', gap: 4, padding: '14px 28px', background: 'var(--status-pre-approved-bg)', border: '1px solid var(--status-pre-approved)', borderRadius: 12 }}>
            <span className="overline-xs" style={{ color: 'var(--status-pre-approved)' }}>HCM document record</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--status-pre-approved)' }}>300009520151018</span>
          </div>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 640 }}>
          {FILED_CHIPS.map((c) => <span key={c} className="pill" style={{ padding: '3px 12px', border: '1px solid var(--status-pre-approved)', color: 'var(--status-pre-approved)' }}><Icon name="check" size={11} />{c}</span>)}
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          <Button variant="outline" size="md" iconLeft="download">Export document record ID</Button>
          <Button variant="action" size="md" iconLeft="plus" onClick={() => { startNew(); }}>Start another onboarding</Button>
        </div>
      </div>
    </div>
  );
}
