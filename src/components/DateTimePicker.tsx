import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../ds';
import { useOutsideClose } from './hooks';

/* Text field with a popover calendar. The typed value stays the source of truth:
   "MM/DD/YYYY" or, with `withTime`, "MM/DD/YYYY · h:mm AM". */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface DateTimePickerProps {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  withTime?: boolean;
  placeholder?: string;
  ariaLabel: string;
  mono?: boolean;
  /** Default time used when a date is picked and none is typed yet. */
  defaultTime?: string;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function parseValue(v: string): { date: Date | null; time: string } {
  const [datePart, timePart] = v.split('·').map((s) => s.trim());
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(datePart || '');
  const date = m ? new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])) : null;
  return { date: date && !Number.isNaN(date.getTime()) ? date : null, time: timePart || '' };
}

function fmtDate(d: Date) { return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`; }

/** "6:00 AM" → "06:00" for the native time input. */
function to24h(t: string): string {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return '';
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return `${pad(h)}:${m[2]}`;
}

/** "06:00" → "6:00 AM" for display. */
function to12h(t: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  if (!m) return '';
  const h = Number(m[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
}

function sameDay(a: Date | null, b: Date) {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DateTimePicker({ id, value, onChange, withTime, placeholder, ariaLabel, mono, defaultTime = '6:00 AM' }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(wrap, open, close);

  const parsed = useMemo(() => parseValue(value), [value]);
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => parsed.date ?? today);
  useEffect(() => { if (open) setView(parsed.date ?? today); }, [open, parsed.date, today]);

  const commit = (date: Date | null, time: string) => {
    if (!date) return;
    onChange(withTime ? `${fmtDate(date)} · ${time || parsed.time || defaultTime}` : fmtDate(date));
  };
  const pickDay = (d: Date) => { commit(d, parsed.time); if (!withTime) setOpen(false); };

  /* 6 weeks starting on the Sunday on or before the 1st, so the grid never jumps height. */
  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [view]);

  const onGridKey = (e: KeyboardEvent<HTMLButtonElement>, d: Date) => {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = new Date(d); next.setDate(d.getDate() + delta);
    if (next.getMonth() !== view.getMonth()) setView(next);
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${fmtDate(next)}"]`)?.focus());
  };

  return (
    <div ref={wrap} className="dtp">
      <input
        id={id}
        className={`input${mono ? ' mono' : ''}`}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      />
      <button
        type="button"
        className="dtp-toggle"
        aria-label={`${open ? 'Close' : 'Open'} calendar`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="calendar" size={14} />
      </button>

      {open && (
        <div className="dtp-pop" role="dialog" aria-label="Choose a date" onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } }}>
          <div className="dtp-head">
            <button type="button" className="ghost-icon" aria-label="Previous month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}><Icon name="chevron-left" size={14} /></button>
            <span className="dtp-title" aria-live="polite">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
            <button type="button" className="ghost-icon" aria-label="Next month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}><Icon name="chevron-right" size={14} /></button>
          </div>
          <div className="dtp-weekdays" aria-hidden="true">{WEEKDAYS.map((w) => <span key={w}>{w}</span>)}</div>
          <div ref={gridRef} className="dtp-grid" role="grid" aria-label={`${MONTHS[view.getMonth()]} ${view.getFullYear()}`}>
            {Array.from({ length: 6 }, (_, w) => (
              <div key={w} role="row" className="dtp-row">
                {cells.slice(w * 7, w * 7 + 7).map((d) => {
                  const outside = d.getMonth() !== view.getMonth();
                  const selected = sameDay(parsed.date, d);
                  const isToday = sameDay(today, d);
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      role="gridcell"
                      data-day={fmtDate(d)}
                      aria-selected={selected}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      tabIndex={selected || (!parsed.date && isToday) ? 0 : -1}
                      className={`dtp-day${outside ? ' out' : ''}${selected ? ' on' : ''}${isToday ? ' today' : ''}`}
                      onClick={() => pickDay(d)}
                      onKeyDown={(e) => onGridKey(e, d)}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {withTime && (
            <div className="dtp-foot">
              <span className="label">Time</span>
              <input
                type="time"
                className="input dtp-time"
                aria-label="Start time"
                value={to24h(parsed.time || '')}
                onChange={(e) => { const t = to12h(e.target.value); if (t) commit(parsed.date ?? today, t); }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
