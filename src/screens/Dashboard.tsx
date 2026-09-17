import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, StatCard } from '../ds';
import { DRAFT_DEFS, FILTER_DEFS, STATUS } from '../lib/data';
import type { LaborRequest, SortState } from '../lib/types';
import { useAccount, useDrafts, useRequests } from '../store/app';
import { useOutsideClose } from '../components/hooks';
import { Pill } from '../components/Pill';
import { SortHeaders } from '../components/SortHeaders';
import { EmptyState } from '../components/EmptyState';

type SortKey = 'id' | 'site' | 'cls' | 'fill' | 'status';
const SORT_DEFS: [SortKey, string][] = [['id', 'Request'], ['site', 'Job site'], ['cls', 'Classifications'], ['fill', 'Filled'], ['status', 'Status']];
const COLS = '110px 1fr 260px 70px 185px';
const KPI_STYLE = { border: '2px solid var(--ds-bg-blue-light)', borderRadius: 18 } as const;

function sortRequests(rows: LaborRequest[], sort: SortState<SortKey>) {
  if (!sort.key) return rows;
  const k = sort.key;
  return rows.slice().sort((a, b) => {
    let va: string | number, vb: string | number;
    if (k === 'fill') { va = a.filled / (a.total || 1); vb = b.filled / (b.total || 1); }
    else if (k === 'status') { va = STATUS[a.status].label; vb = STATUS[b.status].label; }
    else { va = a[k]; vb = b[k]; }
    return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
  });
}

export function Dashboard() {
  const navigate = useNavigate();
  const acct = useAccount()!;
  const reqs = useRequests();
  const drafts = useDrafts();
  const [filter, setFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortState<SortKey>>({ key: null, dir: 1 });
  const filterRef = useRef<HTMLDivElement>(null);
  useOutsideClose(filterRef, filterOpen, useCallback(() => setFilterOpen(false), []));

  const totalOpen = reqs.reduce((a, r) => a + r.total, 0);
  const totalFilled = reqs.reduce((a, r) => a + r.filled, 0);
  const pending = reqs.filter((r) => r.status === 'awaiting' || r.status === 'overdue' || r.status === 'partial');
  const overdue = reqs.filter((r) => r.status === 'overdue').length;
  const filtered = useMemo(() => sortRequests(filter === 'all' ? reqs : reqs.filter((r) => r.status === filter), sort), [reqs, filter, sort]);
  const filterLabel = FILTER_DEFS.find((d) => d[0] === filter)?.[1] ?? '';
  const open = (id: string) => navigate(`/requests/${id}`);
  const newRequest = <Button variant="action" size="md" iconLeft="plus" onClick={() => navigate('/requests/new')}>New labor request</Button>;

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 className="h1">Labor requests &amp; onboarding</h1>
        {newRequest}
      </div>

      <div className="kpi-grid">
        <StatCard label="Active labor requests" value={String(reqs.length)} icon="file-text" footer={reqs.length ? `${totalOpen} openings · ${totalFilled} filled` : 'No labor requests yet'} style={KPI_STYLE} />
        <StatCard label="Awaiting union response" value={String(pending.length)} icon="clock" footer={overdue ? `${overdue} overdue — 5 days without response` : pending.length ? 'All within response window' : 'Nothing waiting on you'} style={KPI_STYLE} />
        <StatCard label="Onboardings in progress" value={String(acct.onboard)} icon="users" footer={acct.onboardF} style={KPI_STYLE} />
        <StatCard label="Completed this week" value={String(acct.done)} icon="circle-check" footer={acct.doneF} style={KPI_STYLE} />
      </div>

      {reqs.length > 0 ? (
        <div className="two-col" style={{ gridTemplateColumns: '1fr 380px', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
          <div className="card card-open col">
            <div className="card-head">
              <div className="row" style={{ gap: 10 }}>
                <h3 className="h3">Active labor requests</h3>
                {filter !== 'all' && (
                  <Pill tone="navy">
                    {filterLabel}
                    <button type="button" aria-label="Clear filter" onClick={() => setFilter('all')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', color: 'inherit' }}><Icon name="x" size={11} /></button>
                  </Pill>
                )}
              </div>
              <div ref={filterRef} data-popover="1" style={{ position: 'relative' }}>
                <button type="button" className="btn-outline-xs" style={{ fontSize: 12, fontWeight: 500, gap: 6 }} onClick={() => setFilterOpen((o) => !o)}>
                  <Icon name="filter" size={13} style={{ color: 'var(--muted-foreground)' }} />Filter<Icon name="chevron-down" size={12} style={{ color: 'var(--muted-foreground)' }} />
                </button>
                {filterOpen && (
                  <div className="menu menu-lg" style={{ top: 34, right: 0, width: 230 }}>
                    <span className="overline-xs" style={{ display: 'block', padding: '10px 14px 6px' }}>Filter by status</span>
                    {FILTER_DEFS.map(([k, label]) => (
                      <button key={k} type="button" className={`menu-item wide${filter === k ? ' on' : ''}`} onClick={() => { setFilter(k); setFilterOpen(false); }}>
                        <span style={{ display: 'inline-flex', width: 14, justifyContent: 'center' }}>{filter === k && <Icon name="check" size={13} style={{ color: 'var(--primary)' }} />}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="table-scroll col flex-1" style={{ minWidth: 0 }}>
              <div style={{ minWidth: 820 }}>
                <SortHeaders defs={SORT_DEFS} sort={sort} onChange={setSort} columns={COLS} />
                <div className="col">
                  {filtered.map((r) => {
                    const t = STATUS[r.status];
                    return (
                      <button key={r.id} type="button" className="trow" aria-label={`Open ${r.id} — ${r.site}`} style={{ gridTemplateColumns: COLS }} onClick={() => open(r.id)}>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{r.id}</span>
                        <span className="truncate" style={{ fontSize: 12, fontWeight: 500 }}>{r.site}</span>
                        <span className="truncate sub">{r.cls}</span>
                        <span className="mono" style={{ fontSize: 12 }}>{r.filled} / {r.total}</span>
                        <Pill bg={t.bg} fg={t.fg} icon={t.icon} style={{ justifySelf: 'start' }}>{t.label}</Pill>
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="col" style={{ alignItems: 'center', gap: 6, padding: '32px 20px', textAlign: 'center' }}>
                      <span className="sub">No requests match this filter.</span>
                      <button type="button" className="btn-flat" onClick={() => setFilter('all')}>Clear filter</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="card-foot" style={{ borderRadius: '0 0 16px 16px', marginTop: 'auto' }}>
              <Icon name="info" size={14} style={{ color: 'var(--primary)' }} />
              <span className="sub">Selecting a request opens its detailed view — every submitted field, classifications and union activity.</span>
            </div>
          </div>

          <div className="col" style={{ gap: 16, minHeight: 0 }}>
            {drafts.length > 0 && (
              <div className="card" style={{ border: '1px dashed var(--border-strong)', flex: '0 0 auto' }}>
                <div className="card-head card-head-sm">
                  <h3 className="h3">Draft labor requests</h3>
                  <span className="pill pill-muted" style={{ padding: '1px 8px' }}>{drafts.length} draft{drafts.length === 1 ? '' : 's'}</span>
                </div>
                {drafts.map((key) => {
                  const d = DRAFT_DEFS[key];
                  return (
                    <button key={key} type="button" className="list-row" aria-label={`Open draft — ${d.site}`} style={{ padding: '12px 20px' }} onClick={() => navigate(`/drafts/${key}`)}>
                      <span className="icon-tile" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}><Icon name="pencil" size={14} /></span>
                      <div className="col flex-1" style={{ gap: 1 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{d.site}</span>
                        <span className="hint">{d.meta}</span>
                      </div>
                      <Icon name="chevron-right" size={14} style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                  );
                })}
              </div>
            )}
            <div className="card col" style={{ border: '1px solid var(--accent-gold)', flex: '0 0 auto' }}>
              <div className="card-head"><h3 className="h3">Pending union responses</h3></div>
              <div className="col">
                {pending.map((p) => {
                  const over = p.status === 'overdue';
                  return (
                    <button key={p.id} type="button" className="list-row" aria-label={`Open ${p.id}`} onClick={() => open(p.id)}>
                      <div className="col flex-1" style={{ gap: 1 }}>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{p.id}</span>
                        <span className="hint truncate">{p.pendNote}</span>
                      </div>
                      <Pill tone={over ? 'bad' : 'warn'} style={{ padding: '1px 8px' }}>{p.pendBadge}</Pill>
                      <Icon name="chevron-right" size={14} style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                  );
                })}
                {pending.length === 0 && <div className="sub" style={{ padding: '14px 20px' }}>Nothing waiting on a union right now.</div>}
              </div>
            </div>
            <div className="card col" style={{ padding: '14px 20px', gap: 8, flex: '0 0 auto' }}>
              <span className="overline">Next on requests</span>
              <span className="sub" style={{ lineHeight: 1.6 }}>A response without a dispatch after 5 business days suggests escalation. Union replies are parsed automatically — confirmed dispatches complete their classification and start onboarding.</span>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState icon="file-text" title="No labor requests yet" body="Requests you submit are created instantly in HCM and appear here with their union status. Confirmed tradesmen then flow into onboarding automatically." action={newRequest} />
      )}
    </div>
  );
}
