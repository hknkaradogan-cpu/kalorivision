import React from 'react';
export const Logo = ({ size = 40 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"><g><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86efac"/><stop offset="1" stop-color="#15a34a"/></linearGradient></defs><path d="M50 32C42 24 22 26 18 46C14 66 30 92 42 90C46 89 48 87 50 87C52 87 54 89 58 90C70 92 86 66 82 46C78 26 58 24 50 32Z" fill="url(#lg)"/><path d="M52 29C52 15 62 7 75 7C75 19 65 29 52 29Z" fill="#15803d"/><path d="M50 32Q49 22 54 13" stroke="#166534" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M30 48C30 40 35 35 41 34" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/></g></svg>);
export const Ring = ({ value, max, size = 190, label, sub, ikon }: { value: number; max: number; size?: number; label: string; sub: string; ikon?: string }) => {
  const r = size / 2 - 14, C = 2 * Math.PI * r, arc = C * 0.75, pct = max > 0 ? Math.min(1, value / max) : 0, over = max > 0 && value > max;
  return (
    <div className="ring" style={{ width: size, height: size * 0.92 }}>
      <svg width={size} height={size} role="img" aria-label={`${label} ${sub}`} style={{ overflow: 'visible' }}>
        <defs><linearGradient id="rg" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#4ade80" /><stop offset="100%" stopColor="#15a34a" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${arc} ${C}`} transform={`rotate(135 ${size / 2} ${size / 2})`} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={over ? 'var(--warn)' : 'url(#rg)'} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${Math.max(0.001, arc * pct)} ${C}`} transform={`rotate(135 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-in">{ikon && <i>{ikon}</i>}<b>{label}</b><span>{sub}</span></div>
    </div>
  );
};
export const Area = ({ data, hedef }: { data: { x: string; y: number }[]; hedef?: number }) => {
  const W = 320, H = 150, px0 = 30, py0 = 16; const mx = Math.max(...data.map(d => d.y), hedef ?? 0, 100) * 1.15;
  const X = (i: number) => px0 + (i * (W - px0 - 10)) / Math.max(1, data.length - 1), Y = (y: number) => H - 22 - (y / mx) * (H - 22 - py0);
  const pts = data.map((d, i) => `${X(i)},${Y(d.y)}`).join(' '); const imax = data.reduce((m, d, i) => (d.y > data[m].y ? i : m), 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="line" role="img" aria-label="Kalori grafiği">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22c55e" stopOpacity=".35" /><stop offset="1" stopColor="#22c55e" stopOpacity="0" /></linearGradient></defs>
      {[0, 0.5, 1].map(f => <g key={f}><line x1={px0} x2={W - 10} y1={Y(mx * f / 1.15)} y2={Y(mx * f / 1.15)} stroke="var(--line)" /><text x={px0 - 4} y={Y(mx * f / 1.15) + 3} fontSize="9" textAnchor="end" fill="var(--muted)">{Math.round(mx * f / 1.15 / 10) * 10}</text></g>)}
      <polygon points={`${X(0)},${Y(0)} ${pts} ${X(data.length - 1)},${Y(0)}`} fill="url(#ag)" />
      <polyline points={pts} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((d, i) => <circle key={i} cx={X(i)} cy={Y(d.y)} r="3" fill="#fff" stroke="#22c55e" strokeWidth="2" />)}
      {data[imax].y > 0 && <g><rect x={Math.min(W - 70, Math.max(px0, X(imax) - 30))} y={Y(data[imax].y) - 26} width="60" height="18" rx="9" fill="#14231a" /><text x={Math.min(W - 70, Math.max(px0, X(imax) - 30)) + 30} y={Y(data[imax].y) - 14} fontSize="10" fill="#fff" textAnchor="middle">{data[imax].y} kcal</text></g>}
      {data.map((d, i) => (data.length <= 12 || i % 5 === 0) && <text key={i} x={X(i)} y={H - 6} fontSize="9" textAnchor="middle" fill="var(--muted)">{d.x}</text>)}
    </svg>
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
