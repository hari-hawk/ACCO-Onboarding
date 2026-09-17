export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** '078 · UA Local 78 — Plumbers & Fitters, LA' → 'UA Local 78' */
export function unionShort(u: string): string {
  return (u.split(' · ')[1] || u).split(' — ')[0];
}

/** '078 · UA Local 78 — …' → '078' */
export function unionCode(u: string): string {
  return String(u).slice(0, 3);
}

export function plural(n: number, word: string, pluralWord?: string): string {
  return n === 1 ? word : pluralWord ?? `${word}s`;
}

/** Status chip tone for an email status string. */
export function emailStatusTone(status: string): 'ok' | 'bad' | 'warn' | 'muted' {
  const s = status.toLowerCase();
  if (s.includes('parsed')) return 'ok';
  if (s.includes('no response')) return 'bad';
  if (s.includes('awaiting')) return 'warn';
  return 'muted';
}

export function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function randomPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function stop(e: { stopPropagation: () => void }) {
  e.stopPropagation();
}
