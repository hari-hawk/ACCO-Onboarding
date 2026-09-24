import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, StatCard } from '../ds';
import {
  OUTCOME_STYLE, RANGE_DAYS, RANGE_LABEL, RANGE_TABS, REPORT_TODAY, REPORT_UNIONS, SPECIALIST_METRICS, SUPER_METRICS,
} from '../lib/data';
import { useHistory } from '../lib/history';
import type { ReportRange, SortState } from '../lib/types';
import { useApp } from '../store/app';
import { Pill } from '../components/Pill';
import { SortHeaders, sortBy } from '../components/SortHeaders';

type HKey = 'ref' | 'detail' | 'confirm' | 'dt' | 'outcome';
const COLS = '120px 1fr 170px 105px 150px';
const PAGE_SIZE = 12;
const KPI_STYLE = { border: '2px solid var(--ds-bg-blue-light)', borderRadius: 18 } as const;

export function Reports() {
  const navigate = useNavigate();
  const key = useApp((s) => s.account)!;
  const specialist = key === 'dana';
  /* A history row opens read-only: the specialist sees the filed record, the superintendent the closed request. */
  const openRow = (ref: string) => navigate(key === 'miguel' ? `/requests/${ref}` : `/reports/record/${ref}`);
  const [range, setRange] = useState<ReportRange>('month');
  const [sort, setSort] = useState<SortState<HKey>>({ key: null, dir: 1 });
  const [page, setPage] = useState(1);
  const rangeLabel = RANGE_LABEL[range];
  const all = useHistory(specialist);

  const rows = useMemo(() => {
    const days = RANGE_DAYS[range];
    const inRange = all.filter((r) => (REPORT_TODAY.getTime() - new Date(r.dt).getTime()) / 86400000 <= days);
    return sortBy(inRange, sort, (r, k) => r[k as HKey]);
  }, [all, range, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const pageRows = rows.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const sm = SUPER_METRICS[range];
  const dk = SPECIALIST_METRICS[range];
  const kpis = specialist
    ? [
        { label: 'Onboardings completed', value: String(dk.done), icon: 'circle-check', footer: `Filed to HCM Documents of Record · ${rangeLabel}` },
        { label: 'Avg extraction time', value: dk.ext, icon: 'timer', footer: 'From first document to profile' },
        { label: 'Fields auto-read', value: dk.auto, icon: 'sparkles', footer: `${dk.rekey} fields re-keyed manually` },
        { label: 'Awaiting INN verification', value: String(dk.inn), icon: 'clock', footer: 'Update status manually when confirmed' },
      ]
    : [
        { label: 'Labor requests', value: String(sm.req), icon: 'file-text', footer: `${sm.open} openings across 4 unions · ${rangeLabel}` },
        { label: 'Avg union response', value: sm.resp, icon: 'clock', footer: 'From email sent to first reply' },
        { label: 'Fill rate', value: sm.fill, icon: 'users', footer: `${sm.disp} of ${sm.open} openings dispatched` },
        { label: 'Overdue responses', value: String(sm.od), icon: 'triangle-alert', footer: '5 business days without reply' },
      ];

  const bars = specialist
    ? (() => {
        const max = Math.max(dk.done, dk.st[0], 1);
        const list = [
          { label: 'Extract & identity check', value: dk.st[0], color: 'var(--primary)' },
          { label: 'Profile', value: dk.st[1], color: 'var(--primary)' },
          { label: 'Forms & sign', value: dk.st[2], color: 'var(--primary)' },
          { label: 'Awaiting INN verification', value: dk.st[3], color: 'var(--accent-gold)' },
          { label: 'Filed to HCM', value: dk.done, color: 'var(--action)' },
        ];
        return list.map((b) => ({ ...b, w: `${Math.max(6, Math.round((b.value / max) * 100))}%` }));
      })()
    : REPORT_UNIONS.map((u, i) => ({ label: u, value: sm.u[i], color: 'var(--primary)', w: `${Math.round((sm.u[i] / sm.u[0]) * 100)}%` }));

  const insights = specialist
    ? [
        { icon: 'sparkles', bg: 'var(--ds-bg-blue-light)', fg: 'var(--primary)', text: `${dk.auto} of fields were read from documents without edits over the ${rangeLabel} — SSN cards are the most re-uploaded document (${dk.retry} ${dk.retry === 1 ? 'retry' : 'retries'}).` },
        { icon: 'clock', bg: 'var(--status-review-required-bg)', fg: 'var(--status-review-required)', text: `${dk.inn} record${dk.inn === 1 ? ' is' : 's are'} waiting on INN verification outside the platform — statuses update manually from the sessions table once confirmed.` },
        { icon: 'circle-check', bg: 'var(--status-pre-approved-bg)', fg: 'var(--status-pre-approved)', text: `Median session runs ${dk.ext} with the tradesman present — ${dk.expired} hit the 30-minute limit in the ${rangeLabel}.` },
      ]
    : [
        { icon: 'clock', bg: 'var(--status-review-required-bg)', fg: 'var(--status-review-required)', text: 'UA Local 78 answers fastest (1.4 days median). LR-2026-0134 is the only request past the 5-day window — escalation suggested.' },
        { icon: 'users', bg: 'var(--ds-bg-blue-light)', fg: 'var(--primary)', text: 'Multi-union requests fill 1.8 days faster than single-union — splitting classifications across locals is paying off.' },
        { icon: 'send', bg: 'var(--status-pre-approved-bg)', fg: 'var(--status-pre-approved)', text: 'Auto-send covered 9 of 12 requests this month; the 3 manual sends were all copy-content into personal email.' },
      ];

  const headers: [HKey, string][] = [['ref', specialist ? 'Worker / Clock' : 'Request'], ['detail', 'Detail'], ['confirm', 'Confirmations'], ['dt', 'Completed'], ['outcome', 'Outcome']];

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div className="col" style={{ gap: 2 }}>
          <h1 className="h1" data-ds="page-title">Reports</h1>
          <span className="sub">{specialist ? 'Onboarding throughput and document quality' : 'Labor request and union response performance'} — {rangeLabel}</span>
        </div>
        <div className="range-seg" role="group" aria-label="Date range">
          {RANGE_TABS.map(([k, label]) => (
            <button key={k} type="button" className={`range-btn${range === k ? ' on' : ''}`} onClick={() => { setRange(k); setPage(1); }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} footer={k.footer} style={KPI_STYLE} />)}
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '1.6fr 420px' }}>
        <div className="card" data-ds="section-card" style={{ minWidth: 0 }}>
          <div className="card-head card-head-sm">
            <h2 className="h3">History — processed records</h2>
            <Button variant="outline" size="xs" iconLeft="download">Export</Button>
          </div>
          <div className="table-scroll">
            <div style={{ minWidth: 760 }}>
              <SortHeaders defs={headers} sort={sort} onChange={(s) => { setSort(s); setPage(1); }} columns={COLS} padding="2px 20px" />
              <div style={{ minHeight: 560 }}>
                {pageRows.map((h) => {
                  const o = OUTCOME_STYLE[h.outcome] ?? OUTCOME_STYLE.Completed;
                  return (
                    <button key={h.ref} type="button" className="trow" data-ds="table-row" aria-label={`Open record ${h.ref}`} style={{ gridTemplateColumns: COLS, gap: 10 }} onClick={() => openRow(h.ref)}>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{h.ref}</span>
                      <span className="truncate" style={{ fontSize: 12 }}>{h.detail}</span>
                      <span className="hint" style={{ lineHeight: 1.4 }}>{h.confirm}</span>
                      <span className="mono" style={{ fontSize: 11 }}>{h.date}</span>
                      <Pill bg={o.bg} fg={o.fg} icon={o.icon} style={{ justifySelf: 'start' }}>{h.outcome}</Pill>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card-foot" style={{ justifyContent: 'space-between', padding: '10px 20px' }}>
            <span className="hint">{rows.length ? `Page ${cur} of ${pages} · ${rows.length} record${rows.length > 1 ? 's' : ''}` : 'No records in this range'}</span>
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className="icon-btn s26" aria-label="Previous page" disabled={cur <= 1} style={{ opacity: cur <= 1 ? 0.45 : 1 }} onClick={() => setPage(Math.max(1, cur - 1))}><Icon name="chevron-left" size={14} /></button>
              <button type="button" className="icon-btn s26" aria-label="Next page" disabled={cur >= pages} style={{ opacity: cur >= pages ? 0.45 : 1 }} onClick={() => setPage(Math.min(pages, cur + 1))}><Icon name="chevron-right" size={14} /></button>
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 16, minWidth: 0 }}>
          <div className="card" data-ds="section-card">
            <div className="card-head card-head-sm"><h2 className="h3">{specialist ? 'Onboardings by stage' : 'Openings by union'}</h2></div>
            <div className="col" style={{ gap: 12, padding: '16px 20px' }}>
              {bars.map((b) => (
                <div key={b.label} className="col" style={{ gap: 4 }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{b.label}</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{b.value}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--muted)', overflow: 'hidden' }}>
                    <div style={{ width: b.w, height: '100%', background: b.color, borderRadius: 999, transition: 'width 500ms var(--ease-standard)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" data-ds="section-card">
            <div className="card-head card-head-sm"><h2 className="h3">Insights</h2></div>
            <div className="col" style={{ gap: 12, padding: '14px 20px' }}>
              {insights.map((ins) => (
                <div key={ins.text} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <span className="icon-tile" style={{ width: 26, height: 26, background: ins.bg, color: ins.fg }}><Icon name={ins.icon} size={13} /></span>
                  <span style={{ fontSize: 12, lineHeight: 1.6 }}>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
