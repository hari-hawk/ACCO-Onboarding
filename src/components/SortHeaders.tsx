import { Icon } from '../ds';
import type { SortState } from '../lib/types';

export interface SortHeadersProps<K extends string> {
  defs: [K, string][];
  sort: SortState<K>;
  onChange: (next: SortState<K>) => void;
  columns: string;
  padding?: string;
  trailingBlank?: boolean;
  iconSize?: number;
}

/** Uppercase 10px column headers that cycle asc → desc → off, exactly like the prototype. */
export function SortHeaders<K extends string>({ defs, sort, onChange, columns, padding, trailingBlank, iconSize = 12 }: SortHeadersProps<K>) {
  return (
    <div className="thead" style={{ gridTemplateColumns: columns, padding }}>
      {defs.map(([key, label]) => {
        const on = sort.key === key;
        const icon = on ? (sort.dir === 1 ? 'arrow-up' : 'arrow-down') : 'arrow-up-down';
        return (
          <button
            key={key}
            type="button"
            className={`th-btn${on ? ' on' : ''}`}
            aria-label={`Sort by ${label}`}
            onClick={() => onChange(on ? (sort.dir === 1 ? { key, dir: -1 } : { key: null, dir: 1 }) : { key, dir: 1 })}
          >
            {label}
            <Icon name={icon} size={iconSize} />
          </button>
        );
      })}
      {trailingBlank && <span />}
    </div>
  );
}

export function sortBy<T>(rows: T[], sort: SortState<string>, pick: (row: T, key: string) => string | number): T[] {
  if (!sort.key) return rows;
  const k = sort.key;
  return rows.slice().sort((a, b) => {
    const va = pick(a, k), vb = pick(b, k);
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sort.dir;
    return String(va).localeCompare(String(vb), undefined, { numeric: true }) * sort.dir;
  });
}
