import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Icon, StatCard } from '../ds';
import { SESSIONS_TAIL, SESSION_IBANEZ, SESSION_STOUT, SESSION_STATUS } from '../lib/data';
import type { Session, SortState } from '../lib/types';
import { useApp } from '../store/app';
import { useOnboarding } from '../store/onboarding';
import { useOutsideClose } from '../components/hooks';
import { useSessionLink } from '../components/useSessionLink';
import { SortHeaders, sortBy } from '../components/SortHeaders';
import { Pill } from '../components/Pill';
import { EmptyState } from '../components/EmptyState';

type SKey = 'name' | 'lr' | 'site' | 'docs' | 'stage' | 'session';
const DEFS: [SKey, string][] = [['name', 'Tradesman'], ['lr', 'Request'], ['site', 'Job site'], ['docs', 'Docs'], ['stage', 'Stage'], ['session', 'Status']];
const COLS = '1.4fr 130px 1.2fr 80px 170px 200px 110px';

export function OnboardingList() {
  const navigate = useNavigate();
  const key = useApp((s) => s.account)!;
  const obQueue = useApp((s) => s.obQueue);
  const ov = useApp((s) => s.obStatusOv);
  const setOverride = useApp((s) => s.setStatusOverride);
  const startNew = useOnboarding((s) => s.startNew);
  const resume = useOnboarding((s) => s.resume);
  const [sort, setSort] = useState<SortState<SKey>>({ key: null, dir: 1 });
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(menuRef, !!menuFor, useCallback(() => setMenuFor(null), []));
  const specialist = key === 'dana';
  const kiosk = useSessionLink();

  const sessions = useMemo<Session[]>(() => {
    if (!specialist) return [];
    const queued: Session[] = obQueue.map((q) => ({ name: q.name, cls: q.cls, lr: q.lr, site: q.site, docs: '1 / 4', stage: 'Extract & identity', session: 'Queued — moved by M. Santos', sIcon: 'inbox', sBg: 'var(--ds-bg-blue-light)', sFg: 'var(--primary)', fields: q.fields, doc: q.doc, union: q.union }));
    const base = [SESSION_STOUT].concat(queued).concat([SESSION_IBANEZ].filter((o) => !obQueue.some((q) => q.lr === o.lr && q.name === o.name))).concat(SESSIONS_TAIL);
    return sortBy(base, sort, (r, k) => r[k as SKey]).map((o) => {
      const k2 = `${o.lr}|${o.name}`;
      const idx = ov[k2];
      if (idx === undefined) return o;
      const opt = SESSION_STATUS[idx];
      return { ...o, session: opt.label, sIcon: opt.icon, sBg: opt.bg, sFg: opt.fg };
    });
  }, [specialist, obQueue, sort, ov]);

  const newOnboarding = () => { startNew(); navigate('/onboarding'); };
  const newBtn = <Button variant="action" size="md" iconLeft="plus" onClick={newOnboarding}>New onboarding</Button>;

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div className="col" style={{ gap: 4 }}>
          <h1 className="h1">Onboardings</h1>
          <span className="sub">Each session has 30 minutes from the identity check. Save &amp; resume keeps your place while the clock runs; when it ends, the session is cleared and recorded on Reports as delayed.</span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button type="button" className="icon-btn" aria-label={kiosk.label} title={kiosk.label} onClick={kiosk.copy} style={{ width: 36, height: 36, borderRadius: 6 }}>
            <Icon name={kiosk.icon} size={15} />
          </button>
          {newBtn}
        </div>
      </div>
      <div className="kpi-grid">
        <StatCard label="In extraction queue" value={String(2 + obQueue.length)} icon="file-stack" footer={obQueue.length ? `${obQueue.length} just moved by the superintendent` : 'Confirmed dispatches awaiting extraction'} />
        <StatCard label="Sessions in progress" value="2" icon="timer" footer="1 active timer · 1 paused" />
        <StatCard label="Tradesman present today" value="1" icon="user" footer="Carla M. Ruiz — Forms & sign" />
        <StatCard label="Filed to HCM this week" value="11" icon="circle-check" footer="Filed to HCM Documents of Record" />
      </div>

      {specialist ? (
        <div className="card col" style={{ flex: 1, minHeight: 0, overflow: 'visible' }}>
          <div className="table-scroll" style={{ borderRadius: '16px 16px 0 0' }}>
            <div style={{ minWidth: 1040 }}>
              <SortHeaders defs={DEFS} sort={sort} onChange={setSort} columns={COLS} padding="8px 20px" trailingBlank iconSize={11} />
              <div className="col">
                {sessions.map((o) => {
                  const k2 = `${o.lr}|${o.name}`;
                  const open = menuFor === k2;
                  return (
                    <div key={k2} className="trow" style={{ gridTemplateColumns: COLS, padding: '10px 20px' }}>
                      <div className="row" style={{ gap: 10, minWidth: 0 }}>
                        <Avatar name={o.name} size="sm" style={{ width: 28, height: 28 }} />
                        <div className="col" style={{ gap: 1, minWidth: 0 }}>
                          <span className="truncate" style={{ fontSize: 12, fontWeight: 600 }}>{o.name}</span>
                          <span className="truncate hint">{o.cls}</span>
                        </div>
                      </div>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{o.lr}</span>
                      <span className="truncate" style={{ fontSize: 12 }}>{o.site}</span>
                      <span className="mono" style={{ fontSize: 12 }}>{o.docs}</span>
                      <Pill tone="navy" style={{ justifySelf: 'start' }}>{o.stage}</Pill>
                      <div ref={open ? menuRef : undefined} style={{ position: 'relative', justifySelf: 'start' }}>
                        <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label="Update status" className="pill" style={{ background: o.sBg, color: o.sFg, border: '1px solid transparent', cursor: 'pointer' }} onClick={() => setMenuFor(open ? null : k2)}>
                          <Icon name={o.sIcon} size={12} />{o.session}<Icon name="chevron-down" size={11} style={{ opacity: .7 }} />
                        </button>
                        {open && (
                          <div className="menu" role="listbox" style={{ top: 26, left: 0, width: 250, borderRadius: 10, zIndex: 60 }}>
                            <div style={{ padding: '8px 12px 4px' }}><span className="overline-xs">Update status — manual</span></div>
                            {SESSION_STATUS.map((opt, i) => (
                              <button key={opt.label} type="button" role="option" aria-selected={ov[k2] === i} className={`menu-item${ov[k2] === i ? ' on' : ''}`} onClick={() => { setOverride(k2, i); setMenuFor(null); }}>
                                <Icon name={opt.icon} size={13} style={{ color: opt.fg }} />{opt.label}
                              </button>
                            ))}
                            <div style={{ padding: '6px 12px 8px', borderTop: '1px solid var(--border)' }}><span style={{ fontSize: 10, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>INN verification and hire updates happen outside this platform — update here once confirmed.</span></div>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="xs" iconLeft="play" onClick={() => { resume(o); navigate('/onboarding'); }}>Resume</Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card-foot" style={{ borderRadius: '0 0 16px 16px', marginTop: 'auto' }}>
            <Icon name="info" size={14} style={{ color: 'var(--primary)' }} />
            <span className="sub">After 30 minutes documents and extracted fields are cleared and nothing is filed — the session appears on Reports as Delayed and must be started again.</span>
          </div>
        </div>
      ) : (
        <EmptyState icon="users" title="No onboarding sessions yet" body="Confirmed tradesmen from union responses appear here automatically, and every session you start is saved for resuming." action={newBtn} />
      )}
    </div>
  );
}
