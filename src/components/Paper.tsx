import type { CSSProperties } from 'react';

/* Grey "scanned photocopy" placeholders used inside document previews. */
export function Skel({ w, h = 4, bg = '#E5E7EB', style }: { w: string; h?: number; bg?: string; style?: CSSProperties }) {
  return <span className="skel" style={{ width: w, height: h, background: bg, ...style }} />;
}

export function SkelLines({ widths, h = 4, bg, gap = 7, style }: { widths: string[]; h?: number; bg?: string; gap?: number; style?: CSSProperties }) {
  return (
    <div className="col" style={{ gap, ...style }}>
      {widths.map((w, i) => <Skel key={i} w={w} h={h} bg={bg} />)}
    </div>
  );
}

export function SignatureLine({ label, w, flex }: { label: string; w?: number; flex?: boolean }) {
  return (
    <div className="col" style={{ gap: 4, width: w, flex: flex ? 1 : undefined }}>
      <span style={{ height: 1, background: '#9CA3AF' }} />
      <span style={{ fontSize: 9, color: '#6B7280' }}>{label}</span>
    </div>
  );
}
