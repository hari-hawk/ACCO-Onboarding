import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ds';
import { SESSION_MINUTES } from '../lib/data';
import { useApp } from '../store/app';
import { useOnboarding, sessionRemaining } from '../store/onboarding';
import { useUi } from '../store/ui';

function mmss(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/* Pill-sized countdown for the tradesman session. Runs from the identity check until the
   packet is filed. At zero the session is cleared, recorded on Reports as Delayed, and the
   specialist is returned to the sessions list to start again. */
export function SessionTimer() {
  const navigate = useNavigate();
  const start = useOnboarding((s) => s.sessionStart);
  const expire = useOnboarding((s) => s.expireSession);
  const addExpired = useApp((s) => s.addExpiredSession);
  const showToast = useUi((s) => s.showToast);
  const [now, setNow] = useState(() => Date.now());
  const fired = useRef(false);

  useEffect(() => {
    if (start === null) return;
    fired.current = false;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [start]);

  const left = sessionRemaining(start, now);

  useEffect(() => {
    if (left !== 0 || fired.current) return;
    fired.current = true;
    const cleared = expire();
    if (cleared) {
      const d = new Date();
      addExpired({
        ref: `S-${d.getTime().toString(36).toUpperCase().slice(-6)}`,
        ...cleared,
        dt: d.toISOString().slice(0, 10),
        date: d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      });
    }
    showToast(`Session expired after ${SESSION_MINUTES} minutes — documents and extracted fields were cleared. Start the onboarding again.`, 'timer');
    navigate('/onboardings');
  }, [left, expire, addExpired, showToast, navigate]);

  if (left === null) return null;
  const tone = left <= 60_000 ? 'pill-bad' : left <= 5 * 60_000 ? 'pill-warn' : 'pill-navy';
  return (
    <span className={`pill ${tone} mono`} data-ds="session-timer" role="timer" aria-live="off" aria-label={`Session time remaining ${mmss(left)}`} title={`Data is cleared when the ${SESSION_MINUTES}-minute session ends`} style={{ padding: '3px 10px', fontSize: 12 }}>
      <Icon name="timer" size={12} />
      {mmss(left)} left
    </span>
  );
}
