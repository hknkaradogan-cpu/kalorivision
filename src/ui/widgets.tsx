import React from 'react';
export const Ring = ({ value, max, size = 170, label, sub, ikon }: { value: number; max: number; size?: number; label: string; sub: string; ikon?: string }) => {
  const r = size / 2 - 12, c = 2 * Math.PI * r, pct = max > 0 ? Math.min(1, value / max) : 0;
  const over = max > 0 && value > max;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${label} ${sub}`}><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#86efac" /><stop offset="100%" stopColor="#16a34a" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth="14" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={over ? 'var(--warn)' : 'url(#rg)'} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-in">{ikon && <i>{ikon}</i>}<b>{label}</b><span>{sub}</span></div>
    </div>
  );
};
export const Bar = ({ ad, v, max, renk, birim = 'g' }: { ad: string; v: number; max: number; renk: string; birim?: string }) => (
  <div className="bar"><div className="bar-h"><span>{ad}</span><span>{Math.round(v)} / {Math.round(max)} {birim}</span></div>
    <div className="bar-t"><div className="bar-f" style={{ width: `${max > 0 ? Math.min(100, (v / max) * 100) : 0}%`, background: renk }} /></div></div>
);
export const Donut = ({ p, c, f }: { p: number; c: number; f: number }) => {
  const tot = p * 4 + c * 4 + f * 9 || 1; const seg = [[p * 4 / tot, 'var(--p)'], [c * 4 / tot, 'var(--c)'], [f * 9 / tot, 'var(--f)']] as const;
  const r = 40, C = 2 * Math.PI * r; let off = 0;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label="Makro dağılımı">
      {seg.map(([s, col], i) => { const el = <circle key={i} cx="55" cy="55" r={r} fill="none" stroke={col} strokeWidth="16" strokeDasharray={`${s * C} ${C}`} strokeDashoffset={-off * C} transform="rotate(-90 55 55)" />; off += s; return el; })}
    </svg>
  );
};
export const Line = ({ data, hedef, birim }: { data: { x: string; y: number }[]; hedef?: number; birim: string }) => {
  if (data.length < 2) return <p className="muted">Grafik için en az 2 kayıt gerekir.</p>;
  const W = 320, H = 140, pad = 24; const ys = data.map(d => d.y).concat(hedef ?? []);
  const mn = Math.min(...ys) - 1, mx = Math.max(...ys) + 1;
  const px = (i: number) => pad + (i * (W - 2 * pad)) / (data.length - 1), py = (y: number) => H - pad - ((y - mn) / (mx - mn)) * (H - 2 * pad);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="line" role="img" aria-label={`Grafik (${birim})`}>
      {hedef !== undefined && <line x1={pad} x2={W - pad} y1={py(hedef)} y2={py(hedef)} stroke="var(--warn)" strokeDasharray="4 4" />}
      <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" points={data.map((d, i) => `${px(i)},${py(d.y)}`).join(' ')} />
      {data.map((d, i) => <circle key={i} cx={px(i)} cy={py(d.y)} r="3.5" fill="var(--accent)" />)}
      <text x={pad} y={H - 4} fontSize="10" fill="var(--muted)">{data[0].x}</text>
      <text x={W - pad} y={H - 4} fontSize="10" fill="var(--muted)" textAnchor="end">{data[data.length - 1].x}</text>
      <text x={pad} y={12} fontSize="10" fill="var(--muted)">{mx.toFixed(0)} {birim}</text>
    </svg>
  );
};
export const Sheet = ({ baslik, kapat, children }: { baslik: string; kapat: () => void; children: React.ReactNode }) => (
  <div className="sheet-bg" onClick={kapat}><div className="sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label={baslik}>
    <div className="sheet-h"><b>{baslik}</b><button className="x" onClick={kapat} aria-label="Kapat">✕</button></div>{children}</div></div>
);
export const f1 = (n?: number) => (n === undefined ? '—' : String(Math.round(n * 10) / 10));
