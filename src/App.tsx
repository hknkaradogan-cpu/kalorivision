import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Meal, emptyState, today } from './lib/types';
import { load, save, wipe } from './lib/store';
import { Beslenme, Home, Istatistik, Kamera, ProfilEkrani } from './ui/Screens';
import { AddFood } from './ui/AddFood';
import { kontrolEt, yerel, yerelPlanla } from './lib/hatirlat';
import { useAdimSayac } from './lib/adim';

const TABS = [['ana', '🏠', 'Ana Sayfa'], ['kamera', '📷', 'Kamera'], ['beslenme', '🍽️', 'Beslenme'], ['istatistik', '📊', 'İstatistik'], ['profil', '👤', 'Profil']] as const;
export default function App() {
  const [s, setS] = useState<AppState | null>(null); const [tab, setTab] = useState<string>('ana'); const [ekle, setEkle] = useState<Meal | null>(null);
  const ilk = useRef(true);
  useEffect(() => { load().then(x => { setS(x); if (!x.profile) setTab('profil'); }); }, []);
  useEffect(() => { if (s) { if (ilk.current) { ilk.current = false; return; } save(s); } }, [s]);
  // Su hatırlatması: uygulama/sekme canlıyken saatinde bildirir (kapalıyken bildirim APK sürümünde yerel bildirimle gelecek)
  const sRef = useRef(s); sRef.current = s;
  useEffect(() => { const t = setInterval(() => { if (sRef.current) kontrolEt(sRef.current); }, 60000); const v = () => { if (sRef.current) kontrolEt(sRef.current); }; document.addEventListener('visibilitychange', v); return () => { clearInterval(t); document.removeEventListener('visibilitychange', v); }; }, []);
  useEffect(() => { if (s && yerel()) yerelPlanla(s).catch(e => console.error('Bildirim planlanamadı', e)); }, [s?.hatirlatma, s?.suBas, s?.suBit, s?.suAralik, s?.waterGoal]);
  const adimEkle = useCallback((n: number) => setS(p => (p ? { ...p, steps: { ...p.steps, [today()]: (p.steps[today()] ?? 0) + n } } : p)), []);
  const adimDurum = useAdimSayac(!!s?.profile, adimEkle);
  const set = useCallback((f: (x: AppState) => AppState) => setS(p => (p ? f(p) : p)), []);
  if (!s) return <div className="load">Yükleniyor…</div>;
  const P = { s, set, git: setTab, ekleAc: setEkle, adimDurum };
  return (<div className="app">
    <main>{tab === 'ana' && <Home {...P} />}{tab === 'kamera' && <Kamera {...P} />}{tab === 'beslenme' && <Beslenme {...P} />}{tab === 'istatistik' && <Istatistik {...P} />}{tab === 'profil' && <ProfilEkrani {...P} />}</main>
    <nav>{TABS.map(([id, ik, ad]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)} aria-label={ad}><span>{ik}</span><small>{ad}</small></button>)}</nav>
    {ekle && <AddFood meal={ekle} kapat={() => setEkle(null)} ekle={e => set(x => ({ ...x, entries: [...x.entries, e] }))} />}
  </div>);
}
export { wipe, emptyState };
