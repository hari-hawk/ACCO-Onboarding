import { useRef, type PointerEvent } from 'react';
import { Button, Icon } from '../../ds';
import { PACKET } from '../../lib/data';
import { useOnboarding } from '../../store/onboarding';
import { SkelLines } from '../../components/Paper';
import { useObDerived } from './derived';

function LockedValue({ label, value, tag, mono }: { label: string; value: string; tag: string; mono?: boolean }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="locked"><span className={mono ? 'mono' : undefined}>{value}</span><span className="locked-tag"><Icon name="lock" size={10} />{tag}</span></div>
    </div>
  );
}

/** Crop the drawn strokes to their bounding box (8px pad) so the stamp is tight. */
function cropSignature(cv: HTMLCanvasElement): string {
  try {
    const ctx = cv.getContext('2d')!;
    const img = ctx.getImageData(0, 0, cv.width, cv.height);
    let minX = cv.width, minY = cv.height, maxX = 0, maxY = 0;
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
      if (img.data[(y * cv.width + x) * 4 + 3] > 10) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
    if (maxX > minX && maxY > minY) {
      const pad = 8, w = maxX - minX + pad * 2, h = maxY - minY + pad * 2;
      const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
      c2.getContext('2d')!.drawImage(cv, minX - pad, minY - pad, w, h, 0, 0, w, h);
      return c2.toDataURL('image/png');
    }
  } catch { /* fall through */ }
  return cv.toDataURL('image/png');
}

export function Sign() {
  const d = useObDerived();
  const clock = useOnboarding((s) => s.clock) || '';
  const pkSigned = useOnboarding((s) => s.pkSigned);
  const pkAgree = useOnboarding((s) => s.pkAgree);
  const pkView = useOnboarding((s) => s.pkView);
  const sigDrawn = useOnboarding((s) => s.sigDrawn);
  const sigData = useOnboarding((s) => s.sigData);
  const toggleAgree = useOnboarding((s) => s.toggleAgree);
  const setSigDrawn = useOnboarding((s) => s.setSigDrawn);
  const signAll = useOnboarding((s) => s.signAll);
  const clearSig = useOnboarding((s) => s.clearSig);
  const setPkView = useOnboarding((s) => s.setPkView);
  const openPin = useOnboarding((s) => s.openPin);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const curTitle = pkView || PACKET[0].title;
  const curSub = PACKET.find((p) => p.title === curTitle)?.sub ?? '';

  const ctx2d = () => {
    const c = canvasRef.current; if (!c) return null;
    const ctx = c.getContext('2d')!;
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1F2937';
    return ctx;
  };
  const pos = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!, r = c.getBoundingClientRect();
    return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)] as const;
  };
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    if (pkSigned) return; const ctx = ctx2d(); if (!ctx) return;
    drawing.current = true; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || pkSigned) return; const ctx = ctx2d(); if (!ctx) return;
    const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke();
    if (!sigDrawn) setSigDrawn(true);
  };
  const up = () => { drawing.current = false; };
  const clear = () => { if (pkSigned) return; const c = canvasRef.current; c?.getContext('2d')?.clearRect(0, 0, c.width, c.height); clearSig(); };
  const sign = () => { const c = canvasRef.current; signAll(c ? cropSignature(c) : null); };
  const sigImg = sigData ? <img src={sigData} alt="Signature" style={{ maxHeight: 36, maxWidth: 140, mixBlendMode: 'multiply' }} /> : null;

  return (
    <div className="page ob-sign">
      <div className="card col" style={{ minHeight: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><span className="overline-xs" style={{ letterSpacing: '.08em' }}>Packet — CA · {d.union} · New hire</span></div>
        <div className="col" style={{ flex: 1, padding: 6 }}>
          {PACKET.map((p) => {
            const cur = curTitle === p.title;
            return (
              <button key={p.title} type="button" className={`pk-row${cur ? ' on' : ''}`} onClick={() => setPkView(p.title)}>
                <Icon name={pkSigned ? 'circle-check' : 'file-text'} size={14} style={{ color: pkSigned ? 'var(--status-pre-approved)' : cur ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                <span className="truncate flex-1">{p.title}</span>
              </button>
            );
          })}
        </div>
        <div className="card-foot" style={{ padding: '10px 16px' }}><span className="hint" style={{ lineHeight: 1.5 }}>Signed <span className="mono" style={{ fontWeight: 600 }}>{pkSigned ? '12 of 12' : '0 of 12'}</span> · stamped {clock} · 09/08/2026</span></div>
      </div>

      <div className="card col" style={{ minHeight: 0 }}>
        <div className="card-head card-head-sm">
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{curTitle}</h3>
          <span className="hint">Pre-filled from documents, HCM and dispatch</span>
        </div>
        <div className="col" style={{ flex: 1, overflow: 'auto', padding: '16px 20px', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 16px' }}>
            <LockedValue label="Legal name" value={d.name} tag="From documents" />
            <LockedValue label="Clock / person number" value={clock} tag="HCM" mono />
            <LockedValue label="Hire date" value="07/07/2026" tag="From dispatch" />
            <LockedValue label="Classification" value="Jrny Fitter · Local 246" tag="From dispatch" />
          </div>
          <div className="field">
            <span className="label" style={{ color: 'var(--muted-foreground)' }}>{curSub}</span>
            <SkelLines widths={['92%', '84%', '89%', '62%']} bg="var(--muted)" style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--background)' }} />
          </div>
          {pkSigned && (
            <div className="row" style={{ gap: 10, padding: '10px 14px', background: 'var(--status-pre-approved-bg)', border: '1px solid var(--status-pre-approved)', borderRadius: 10 }}>
              <Icon name="circle-check" size={14} style={{ color: 'var(--status-pre-approved)' }} />
              <span style={{ fontSize: 12, color: 'var(--status-pre-approved)', fontWeight: 500 }}>Signed — {d.name} · {clock} · 09/08/2026</span>
              <span className="ml-auto" style={{ display: 'inline-flex' }}>{sigImg}</span>
            </div>
          )}
        </div>
        <div className="card-foot" style={{ padding: '10px 20px' }}><span className="hint">Select any form on the left to review its filled data. Use the stage breadcrumb above to move backward or forward at any time.</span></div>
      </div>

      <div className="card col" style={{ minHeight: 0 }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}><h3 className="h3">Sign once</h3></div>
        <div className="col" style={{ flex: 1, gap: 12, padding: '16px 18px', overflow: 'auto' }}>
          <div className="col" style={{ position: 'relative', gap: 4 }}>
            <canvas ref={canvasRef} width={560} height={240} aria-label="Draw your signature" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
              style={{ width: '100%', height: 120, border: '1.5px dashed var(--border-strong)', borderRadius: 10, background: 'var(--background)', cursor: 'crosshair', touchAction: 'none', boxSizing: 'border-box' }} />
            {!sigDrawn && <span style={{ position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--muted-foreground)', pointerEvents: 'none' }}>Draw your signature here</span>}
            <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="link-btn" style={{ fontWeight: 500 }} onClick={clear}>Clear</button></div>
          </div>
          <span className="sub" style={{ lineHeight: 1.6 }}>One signature applies to all 12 documents. Name, clock / person number {clock} and date are stamped automatically on every form.</span>
          {!pkSigned ? (
            <>
              <div className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
                <button type="button" aria-label="Agree to sign electronically" aria-pressed={pkAgree} className={`checkbox${pkAgree ? ' on' : ''}`} style={{ width: 18, height: 18, marginTop: 1 }} onClick={toggleAgree}>
                  {pkAgree && <Icon name="check" size={12} style={{ color: '#fff' }} />}
                </button>
                <span style={{ fontSize: 12, lineHeight: 1.5 }}>I have read all 12 documents and agree to sign them electronically.</span>
              </div>
              <Button variant="primary" size="md" iconLeft="pencil" fullWidth disabled={!pkAgree || !sigDrawn} onClick={sign}>Sign all 12 documents</Button>
            </>
          ) : (
            <div className="row" style={{ gap: 6 }}><Icon name="circle-check" size={14} style={{ color: 'var(--status-pre-approved)' }} /><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-pre-approved)' }}>All 12 documents signed</span></div>
          )}
        </div>
        <div className="col" style={{ gap: 6, padding: '12px 18px', background: 'var(--ds-bg-gray-light)', borderTop: '1px solid var(--border)' }}>
          <Button variant="action" size="md" iconRight="arrow-right" fullWidth disabled={!pkSigned} onClick={() => openPin('file')}>Submit &amp; file in HCM</Button>
          <span className="hint" style={{ textAlign: 'center' }}>Verification PIN required to file</span>
        </div>
      </div>
    </div>
  );
}
