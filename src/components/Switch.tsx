export interface SwitchProps {
  on: boolean;
  onToggle: () => void;
  label: string;
}

export function Switch({ on, onToggle, label }: SwitchProps) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`switch${on ? ' on' : ''}`} onClick={onToggle}>
      <span className="knob" />
    </button>
  );
}

export function SettingRow({ on, onToggle, label, title, body, divider }: SwitchProps & { title: string; body: string; divider?: boolean }) {
  return (
    <div className="row" style={{ gap: 14, padding: '14px 24px', borderTop: divider ? '1px solid var(--border)' : undefined }}>
      <Switch on={on} onToggle={onToggle} label={label} />
      <div className="col flex-1" style={{ gap: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{title}</span>
        <span className="hint" style={{ lineHeight: 1.5 }}>{body}</span>
      </div>
      <span className={`pill ${on ? 'pill-ok' : 'pill-muted'}`} style={{ padding: '2px 10px' }}>{on ? 'Enabled' : 'Off'}</span>
    </div>
  );
}
