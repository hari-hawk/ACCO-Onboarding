import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { Icon } from '../ds';
import { useOutsideClose } from './hooks';

/* The prototype hand-rolls its selects: a bordered button with a chevron, and a
   listbox dropped 58px below the field label. Kept as a component so every field matches. */

export interface SelectMenuProps {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
  ariaLabel?: string;
  top?: number;
  style?: CSSProperties;
}

export function SelectMenu({ value, placeholder, options, onChange, ariaLabel, top = 36, style }: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        data-ds="select"
        className={`select-btn${value ? '' : ' placeholder'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{value || placeholder}</span>
        <Icon name="chevron-down" size={14} style={{ color: 'var(--muted-foreground)' }} />
      </button>
      {open && (
        <div className="menu" role="listbox" style={{ top, left: 0, right: 0 }}>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={o === value}
              className={`menu-item${o === value ? ' on' : ''}`}
              onClick={() => { onChange(o); setOpen(false); }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Union picker: multi-select, values joined with ' + ' like the request record. */
export interface UnionSelectProps {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  openExternal?: boolean;
  onOpenChange?: (o: boolean) => void;
}

export function UnionMultiSelect({ value, options, onChange, openExternal, onOpenChange }: UnionSelectProps) {
  const [openLocal, setOpenLocal] = useState(false);
  const open = openExternal ?? openLocal;
  const setOpen = useCallback((o: boolean) => { setOpenLocal(o); onOpenChange?.(o); }, [onOpenChange]);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useOutsideClose(ref, open, close);
  const selected = value.split(' + ').filter(Boolean);
  const display = selected.length === 0
    ? 'Union(s) — suggested from trade + jurisdiction…'
    : selected.length === 1
      ? selected[0]
      : selected.map((u) => (u.split(' · ')[1] || u).split(' — ')[0]).join(' + ');
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className={`select-btn${selected.length ? '' : ' placeholder'}`} aria-haspopup="listbox" aria-expanded={open} aria-label="Union code and description" onClick={() => setOpen(!open)}>
        <span className="truncate">{display}</span>
        <Icon name="chevron-down" size={14} style={{ color: 'var(--muted-foreground)' }} />
      </button>
      {open && (
        <div className="menu" role="listbox" style={{ top: 36, left: 0, right: 0 }}>
          <div style={{ padding: '7px 12px 3px' }}><span className="overline-xs">Select one or more unions</span></div>
          {options.map((u) => {
            const on = selected.includes(u);
            return (
              <button
                key={u}
                type="button"
                role="option"
                aria-selected={on}
                className={`menu-item${on ? ' on' : ''}`}
                onClick={() => onChange((on ? selected.filter((x) => x !== u) : selected.concat(u)).join(' + '))}
              >
                <span className={`checkbox${on ? ' on' : ''}`} style={{ width: 15, height: 15 }}>
                  {on && <Icon name="check" size={10} style={{ color: '#fff' }} />}
                </span>
                {u}
              </button>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="link-btn" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
