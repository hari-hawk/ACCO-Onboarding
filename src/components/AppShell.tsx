import { useCallback, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Icon, NavBar } from '../ds';
import { MIGUEL_NOTIFS } from '../lib/data';
import { landingFor, useAccount, useActiveEmail, useApp } from '../store/app';
import { useUi } from '../store/ui';
import { useOutsideClose } from './hooks';
import { Modal, Scrim } from './Modal';
import { useSessionLink } from './useSessionLink';
import { randomPin } from '../lib/utils';

type PmStep = 'view' | 'ms' | 'busy' | 'new';

export function AppShell() {
  const acct = useAccount()!;
  const email = useActiveEmail();
  const key = useApp((s) => s.account)!;
  const obQueue = useApp((s) => s.obQueue);
  const signOut = useApp((s) => s.signOut);
  const setPin = useApp((s) => s.setPin);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pinMgr, setPinMgr] = useState<PmStep | null>(null);
  const [pmPin, setPmPin] = useState('');
  const popRef = useRef<HTMLDivElement>(null);
  const closeAll = useCallback(() => { setMenuOpen(false); setNotifOpen(false); }, []);
  useOutsideClose(popRef, menuOpen || notifOpen, closeAll);
  const kiosk = useSessionLink();
  const toast = useUi((s) => s.toast);
  /* In kiosk mode every control outside New onboarding is refused with a toast. */
  const guarded = (fn: () => void) => () => { if (kiosk.active) kiosk.restricted(); else fn(); };

  const isSpecialist = key === 'dana';
  const navItems = isSpecialist
    ? [{ id: 'onboardings', label: 'Onboardings' }, { id: 'reports', label: 'Reports' }]
    : [{ id: 'dashboard', label: 'Dashboard' }, { id: 'emails', label: 'Emails' }, { id: 'reports', label: 'Reports' }];
  const navActive = pathname.startsWith('/emails') ? 'emails' : pathname.startsWith('/onboarding') ? 'onboardings' : pathname.startsWith('/reports') ? 'reports' : 'dashboard';

  const notifs = key === 'miguel'
    ? MIGUEL_NOTIFS.map((n) => ({ ...n, go: () => navigate(`/requests/${n.id}`) }))
    : key === 'dana'
      ? obQueue.map((q) => ({ icon: 'inbox', bg: 'var(--ds-bg-blue-light)', fg: 'var(--primary)', text: `1 new request moved to onboarding — ${q.name} (${q.lr}) by M. Santos`, ref: undefined, time: 'Just now', go: () => navigate('/onboardings') }))
      : [];

  const confirmMs = () => {
    setPinMgr('busy');
    setTimeout(() => { const p = randomPin(); setPmPin(p); setPin(p); setPinMgr('new'); }, 1200);
  };

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <NavBar product="Onboarding" items={navItems} activeId={navActive}
        onSelect={(id) => { closeAll(); if (kiosk.active && id !== 'onboardings') { kiosk.restricted(); return; } navigate(`/${id}`); }}
        onHome={() => { closeAll(); navigate(landingFor(key)); }}
        style={{ zIndex: 'var(--z-dropdown)' as unknown as number }} right={
        <div ref={popRef} data-popover="1" className="row nav-cluster" style={{ position: 'relative', gap: 8 }}>
          <button type="button" className="nav-ctl" aria-label="Notifications" aria-expanded={notifOpen} onClick={guarded(() => { setNotifOpen((o) => !o); setMenuOpen(false); })} style={{ position: 'relative', width: 32, height: 32, borderRadius: 8 }}>
            <Icon name="bell" size={16} />
            {notifs.length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: 'var(--destructive)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--nav)' }}>{notifs.length}</span>
            )}
          </button>
          <button type="button" className="nav-ctl" aria-label="Account menu" aria-expanded={menuOpen} onClick={guarded(() => { setMenuOpen((o) => !o); setNotifOpen(false); })} style={{ gap: 6, padding: '2px 10px 2px 4px', borderRadius: 999 }}>
            <span className="round-icon" style={{ width: 24, height: 24, background: '#fff', color: 'var(--nav)', fontSize: 10, fontWeight: 700, overflow: 'hidden' }}>
              {acct.photo ? <img src={acct.photo} alt="Profile photo" style={{ width: '100%', height: '100%', objectFit: 'cover', background: acct.photoBg || 'var(--muted)', padding: '8%', boxSizing: 'border-box' }} /> : acct.initials}
            </span>
            <span className="nav-short" style={{ fontSize: 12, fontWeight: 500 }}>{acct.short}</span>
            <Icon name="chevron-down" size={12} style={{ color: 'rgba(255,255,255,.75)' }} />
          </button>

          {notifOpen && (
            <div className="card" role="dialog" aria-label="Notifications" style={{ position: 'absolute', top: 40, right: 0, width: 'min(360px, calc(100vw - 32px))', borderRadius: 12, boxShadow: 'var(--elev-3)', color: 'var(--foreground)' }}>
              <div className="row" style={{ justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                <button type="button" className="link-btn" style={{ fontWeight: 500 }} onClick={closeAll}>Mark all read</button>
              </div>
              {notifs.length > 0 ? (
                <div className="col">
                  {notifs.map((n, i) => (
                    <button key={i} type="button" className="list-row" style={{ alignItems: 'flex-start', padding: '12px 16px' }} onClick={() => { closeAll(); n.go(); }}>
                      <span className="icon-tile" style={{ background: n.bg, color: n.fg }}><Icon name={n.icon} size={14} /></span>
                      <div className="col" style={{ gap: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.45, color: 'var(--foreground)' }}>{n.text}</span>
                        <span className="hint">{n.ref && <><span className="mono">{n.ref}</span> · </>}{n.time}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="col" style={{ alignItems: 'center', gap: 6, padding: '28px 16px', textAlign: 'center' }}>
                  <Icon name="bell" size={18} style={{ color: 'var(--muted-foreground)' }} />
                  <span className="sub">No notifications yet — union replies and status changes appear here.</span>
                </div>
              )}
            </div>
          )}

          {menuOpen && (
            <div className="card" style={{ position: 'absolute', top: 40, right: 0, width: 260, borderRadius: 12, boxShadow: 'var(--elev-3)', color: 'var(--foreground)' }}>
              <div className="col" style={{ gap: 2, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{acct.name}</span>
                <span className="hint">{email}</span>
                <span className="hint">{acct.role} · from Entra ID groups</span>
              </div>
              <button type="button" className="menu-item tall" onClick={() => { closeAll(); navigate('/profile'); }}><Icon name="user" size={14} style={{ color: 'var(--muted-foreground)' }} />My profile</button>
              {isSpecialist && (
                <button type="button" className="menu-item tall" onClick={() => { closeAll(); setPinMgr('view'); }}><Icon name="shield-check" size={14} style={{ color: 'var(--muted-foreground)' }} />Verification PIN</button>
              )}
              <button type="button" className="menu-item tall" onClick={() => { closeAll(); signOut(); navigate('/login', { replace: true }); }}><Icon name="log-out" size={14} style={{ color: 'var(--muted-foreground)' }} />Sign out</button>
            </div>
          )}
        </div>
      } />

      {kiosk.active && (
        <div className="kiosk-bar" role="status">
          <Icon name="lock" size={13} />
          <span>Session link active — this device is limited to New onboarding until the session ends.</span>
          <button type="button" onClick={kiosk.end}>End session</button>
        </div>
      )}

      <main id="main" className="app-main" tabIndex={-1} style={{ outline: 'none' }}>
        <Outlet context={{ openPinMgr: () => setPinMgr('view') }} />
      </main>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Icon name={toast.icon} size={14} />
          <span>{toast.text}</span>
        </div>
      )}

      {pinMgr && (
        <Scrim onClose={() => setPinMgr(null)} zIndex={640}>
          <Modal width={420} label="Verification PIN" padded={false}>
            <div className="modal-head">
              <span style={{ fontSize: 14, fontWeight: 600 }}>Verification PIN</span>
              <button type="button" className="ghost-icon" aria-label="Close" onClick={() => setPinMgr(null)}><Icon name="x" size={14} /></button>
            </div>
            {pinMgr === 'view' && (
              <div className="col" style={{ gap: 12, padding: 20 }}>
                <span className="sub" style={{ lineHeight: 1.6 }}>Your 6-digit PIN authorizes human-in-the-loop submissions to HCM — profile creation and packet filing. Regenerating requires re-authentication with your Microsoft account.</span>
                <div className="row" style={{ justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--border-strong)', borderRadius: 10 }}>
                  <span className="overline">Current PIN</span>
                  <span className="mono" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '.35em' }}>••••••</span>
                </div>
                <div className="row" style={{ justifyContent: 'flex-end' }}><Button variant="primary" size="sm" iconLeft="rotate-cw" onClick={() => setPinMgr('ms')}>Regenerate PIN</Button></div>
              </div>
            )}
            {pinMgr === 'ms' && (
              <div className="col" style={{ alignItems: 'center', gap: 12, padding: '24px 20px', textAlign: 'center' }}>
                <span className="round-icon" style={{ width: 40, height: 40, background: 'var(--ds-bg-blue-light)', color: 'var(--primary)' }}><Icon name="shield-check" size={20} /></span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Confirm with Microsoft</span>
                <span className="sub" style={{ lineHeight: 1.6 }}>Double authentication: approve this request with your Microsoft Entra ID ({email}) to regenerate your PIN.</span>
                <Button variant="primary" size="sm" iconLeft="log-in" onClick={confirmMs}>Confirm with Microsoft</Button>
              </div>
            )}
            {pinMgr === 'busy' && (
              <div className="col" style={{ alignItems: 'center', gap: 10, padding: '32px 20px' }}>
                <Icon name="loader-2" size={20} className="spin" style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Verifying with Microsoft Entra ID…</span>
              </div>
            )}
            {pinMgr === 'new' && (
              <div className="col" style={{ alignItems: 'center', gap: 12, padding: '24px 20px', textAlign: 'center' }}>
                <span className="round-icon" style={{ width: 40, height: 40, background: 'var(--status-pre-approved-bg)', color: 'var(--status-pre-approved)' }}><Icon name="circle-check" size={20} /></span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>New PIN generated</span>
                <div className="row" style={{ gap: 10, padding: '10px 18px', border: '1px solid var(--status-pre-approved)', borderRadius: 10, background: 'var(--status-pre-approved-bg)' }}>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '.3em', color: 'var(--status-pre-approved)' }}>{pmPin}</span>
                </div>
                <span className="hint">Shown once — it replaces your previous PIN immediately.</span>
                <Button variant="outline" size="sm" onClick={() => setPinMgr(null)}>Done</Button>
              </div>
            )}
          </Modal>
        </Scrim>
      )}
    </div>
  );
}

export interface ShellContext { openPinMgr: () => void }
