import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../ds';
import { OUTCOME_STYLE, buildSpecialistHistory, buildSuperHistory } from '../lib/data';
import type { KV } from '../lib/types';
import { useApp } from '../store/app';
import { Pill } from '../components/Pill';

const SPECIALIST_HISTORY = buildSpecialistHistory();
const SUPER_HISTORY = buildSuperHistory();

/* 3b. Historical record — a closed row from Reports, frozen as filed. */
export function ReportRecord() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const key = useApp((s) => s.account)!;
  const specialist = key === 'dana';
  const h = (specialist ? SPECIALIST_HISTORY : SUPER_HISTORY).find((r) => r.ref === ref);
  if (!h) return <Navigate to="/reports" replace />;

  const o = OUTCOME_STYLE[h.outcome] ?? OUTCOME_STYLE.Completed;
  const parts = h.detail.split(' — ');
  const rest = (parts[1] || '').split(' · ');
  const title = parts[0] || h.ref;
  const fields: KV[] = specialist
    ? [
        { k: 'Legal name', v: parts[0] || '—' }, { k: 'Classification', v: rest[0] || '—' }, { k: 'Local union', v: rest[1] || '—' },
        { k: 'Labor request', v: rest[2] || '—' }, { k: 'Clock / record no.', v: h.ref }, { k: 'Completed', v: h.date || '—' },
        { k: 'Confirmation', v: h.confirm }, { k: 'Outcome', v: h.outcome },
      ]
    : [
        { k: 'Request', v: parts[0] || h.detail || '—' }, { k: 'Detail', v: parts.slice(1).join(' — ') || '—' }, { k: 'Reference', v: h.ref },
        { k: 'Completed', v: h.date || '—' }, { k: 'Confirmation', v: h.confirm }, { k: 'Outcome', v: h.outcome },
      ];

  const disabledBtn = (icon: string, label: string) => (
    <button type="button" disabled title="Disabled — record is closed" className="btn-outline-sm" style={{ height: 32, borderRadius: 6, opacity: .5, cursor: 'not-allowed' }}>
      <Icon name={icon} size={13} />{label}
    </button>
  );

  return (
    <div className="page">
      <div className="row" style={{ justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 12 }}>
          <button type="button" className="icon-btn s32" aria-label="Back to reports" onClick={() => navigate('/reports')}><Icon name="chevron-left" size={15} /></button>
          <div className="col" style={{ gap: 2 }}>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <h1 className="h1">{title}</h1>
              <Pill bg={o.bg} fg={o.fg} icon={o.icon} iconSize={11}>{h.outcome}</Pill>
            </div>
            <span className="sub">{(parts[1] || '')} · Clock {h.ref} · Historical record — read-only</span>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {disabledBtn('send', 'Email')}
          {disabledBtn('external-link', 'Share')}
        </div>
      </div>

      <div className="card">
        <div className="card-head card-head-xs" style={{ padding: '10px 24px' }}>
          <h3 className="h3">{specialist ? 'HCM profile — as filed' : 'Labor request — as closed'}</h3>
          <span className="hint">As filed — values are frozen on close</span>
        </div>
        <div className="kv-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px 20px', padding: '16px 24px' }}>
          {fields.map((f) => (
            <div key={f.k} className="col" style={{ gap: 2 }}>
              <span className="label-sm">{f.k}</span>
              <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{f.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="row" style={{ gap: 8, padding: '10px 14px', background: 'var(--ds-bg-gray-light)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <Icon name="info" size={13} style={{ color: 'var(--muted-foreground)', flex: '0 0 auto' }} />
        <span className="hint">
          {specialist
            ? 'Documents are not retained on closed records — the signed packet was routed to the respective departments. Only the filed profile data is shown here.'
            : 'This request is closed — emailing, sharing and edits are disabled. The data shown is the request as it was closed.'}
        </span>
      </div>
    </div>
  );
}
