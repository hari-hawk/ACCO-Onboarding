import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Icon } from '../ds';
import { ACCOUNTS, ACCOUNT_PICKS, LOGIN_SLIDES, LOGIN_TAGS } from '../lib/data';
import type { AccountKey } from '../lib/types';
import { landingFor, useApp } from '../store/app';
import { useEscape } from '../components/hooks';
import { stop } from '../lib/utils';

type Popup = 'closed' | 'pick' | 'email' | 'busy';

function Brand({ size, sub }: { size: number; sub?: string }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <span className="round-icon" style={{ width: size, height: size, background: 'var(--brand-navy)', border: '1px solid var(--accent-gold)', color: '#fff', fontSize: size > 36 ? 11 : 10, fontWeight: 700 }}>acco</span>
      <div className="col">
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 'var(--ls-tight)', color: '#fff' }}>{sub ? 'ACCO' : 'Onboarding'}</span>
        {sub && <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.75)' }}>{sub}</span>}
      </div>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const signIn = useApp((s) => s.signIn);
  const [slide, setSlide] = useState(0);
  const heldAt = useRef(0);
  const [popup, setPopup] = useState<Popup>('closed');
  const [email, setEmail] = useState('');
  const [busyEmail, setBusyEmail] = useState('');

  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - heldAt.current < 8000) return;
      setSlide((s) => (s + 1) % LOGIN_SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const closePopup = useCallback(() => { if (popup !== 'busy') setPopup('closed'); }, [popup]);
  useEscape(popup !== 'closed', closePopup);

  const go = (key: AccountKey, typed: string | null) => {
    setBusyEmail(typed || ACCOUNTS[key].email);
    setPopup('busy');
    setTimeout(() => {
      signIn(key, typed);
      navigate(landingFor(key), { replace: true });
    }, 1100);
  };

  return (
    <div className="login">
      <div className="login-hero">
        <div style={{ position: 'absolute', inset: 0, background: 'var(--dot-pattern)' }} />
        <div style={{ position: 'relative' }}><Brand size={40} sub="Onboarding portal" /></div>
        <div className="col" style={{ position: 'relative', gap: 24, maxWidth: 620, flex: 1, minHeight: 0, justifyContent: 'center', width: '100%' }}>
          <div style={{ position: 'relative', overflow: 'hidden' }} aria-label="Onboarding workflow highlights">
            <div style={{ display: 'flex', transform: `translateX(-${slide * 100}%)`, transition: 'transform 500ms var(--ease-standard)' }}>
              {LOGIN_SLIDES.map((sl) => (
                <div key={sl.title} className="col" style={{ flex: '0 0 100%', gap: 16, paddingRight: 32, boxSizing: 'border-box' }}>
                  <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: 'var(--ls-tight)', color: '#fff', lineHeight: 1.2, textWrap: 'pretty' }}>{sl.title}</span>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,.78)', lineHeight: 1.65, maxWidth: 480, textWrap: 'pretty' }}>{sl.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            {LOGIN_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => { setSlide(i); heldAt.current = Date.now(); }}
                style={{ width: i === slide ? 32 : 16, height: 4, border: 'none', borderRadius: 999, background: i === slide ? 'var(--accent-gold)' : 'rgba(255,255,255,.3)', cursor: 'pointer', padding: 0, transition: 'all 300ms var(--ease-standard)' }}
              />
            ))}
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', paddingTop: 8 }}>
            {LOGIN_TAGS.map((t) => <span key={t} className="hero-tag">{t}</span>)}
          </div>
        </div>
        <span style={{ position: 'relative', fontSize: 11, color: 'rgba(255,255,255,.55)' }}>© 2026 ACCO Engineered Systems. All rights reserved.</span>
      </div>

      <div className="login-panel">
        <div className="col" style={{ width: 340, maxWidth: '100%', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <Brand size={36} />
          <div className="col" style={{ gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 'var(--ls-tight)', color: '#fff' }}>Sign In</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>Welcome to your ACCO onboarding workspace</span>
          </div>
          <button type="button" className="ms-btn" onClick={() => setPopup('pick')}>
            <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true">
              <rect x="0" y="0" width="10" height="10" fill="#F25022" /><rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
              <rect x="0" y="11" width="10" height="10" fill="#00A4EF" /><rect x="11" y="11" width="10" height="10" fill="#FFB900" />
            </svg>
            Sign in with Microsoft Entra ID
          </button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>Use your authorized account to sign in</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <Icon name="shield-check" size={13} style={{ color: 'rgba(255,255,255,.5)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Enterprise-grade security — role from AD group membership</span>
          </div>
        </div>

        {popup !== 'closed' && (
          <div style={{ position: 'absolute', inset: 0, background: '#101828', zIndex: 'var(--z-modal)' as unknown as number, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div className="card" role="region" aria-label="Microsoft Entra ID sign-in" onClick={stop} style={{ width: 440, maxWidth: '100%', borderRadius: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--ds-bg-gray-light)' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted-foreground)' }}>login.microsoftonline.com</span>
                <button type="button" className="ghost-icon" aria-label="Close sign-in popup" onClick={closePopup}><Icon name="x" size={14} /></button>
              </div>

              {popup === 'pick' && (
                <div className="col" style={{ gap: 14, padding: 24 }}>
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>Microsoft Entra ID</span>
                    <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: 'var(--ls-tight)' }}>Pick an account</span>
                  </div>
                  <div className="col" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    {ACCOUNT_PICKS.map((p, i) => {
                      const a = ACCOUNTS[p.key];
                      return (
                        <button key={p.key} type="button" className={`acct-row${i === 0 ? ' on' : ''}`} onClick={() => go(p.key, null)}>
                          <Avatar name={a.name} size="sm" style={{ width: 28, height: 28 }} />
                          <div className="col flex-1">
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</span>
                            <span className="hint">{a.email} · {p.blurb}</span>
                          </div>
                          <Icon name="chevron-right" size={14} style={{ color: 'var(--muted-foreground)' }} />
                        </button>
                      );
                    })}
                    <button type="button" className="acct-row" onClick={() => setPopup('email')}>
                      <span className="round-icon" style={{ width: 28, height: 28, background: 'var(--muted)', color: 'var(--muted-foreground)' }}><Icon name="user-plus" size={14} /></span>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>Use another account</span>
                    </button>
                  </div>
                  <span className="hint" style={{ lineHeight: 1.5 }}>Your role is read from Entra ID group membership at sign-in. A mid-session role change forces re-authentication so new permissions apply immediately.</span>
                </div>
              )}

              {popup === 'email' && (
                <div className="col" style={{ gap: 14, padding: 24 }}>
                  <div className="col" style={{ gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>Microsoft Entra ID</span>
                    <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: 'var(--ls-tight)' }}>Sign in</span>
                  </div>
                  <div className="col" style={{ gap: 6 }}>
                    <label htmlFor="entra-email" className="label">Work email</label>
                    <input id="entra-email" type="email" className="input" style={{ height: 36 }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@accoes.com" />
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className="btn-flat" onClick={() => setPopup('pick')}>Back</button>
                    <Button variant="primary" size="md" disabled={!email.trim()} onClick={() => email.trim() && go('alex', email.trim())}>Next</Button>
                  </div>
                </div>
              )}

              {popup === 'busy' && (
                <div className="col" style={{ alignItems: 'center', gap: 12, padding: '40px 24px' }}>
                  <Icon name="loader-2" size={22} className="spin" style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: 12, fontWeight: 500 }}>Signing in as {busyEmail}…</span>
                  <span className="hint">Reading role from Entra ID group membership</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
