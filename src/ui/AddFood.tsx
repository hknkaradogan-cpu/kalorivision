import React, { useEffect, useRef, useState } from 'react';
import { FOODS, Food, searchFoods } from '../data/foods';
import { Entry, Meal, MEALS, Nut, scale, today } from '../lib/types';
import { UrunBilgi, barkodAra } from '../lib/off';
import { Sheet, f1 } from './widgets';
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function AddFood({ meal, date, kapat, ekle, baslangic }: { meal: Meal; date?: string; kapat: () => void; ekle: (e: Entry) => void; baslangic?: 'ara' | 'barkod' | 'manuel' }) {
  const [sek, setSek] = useState<'ara' | 'barkod' | 'manuel'>(baslangic ?? 'ara');
  const [ogun, setOgun] = useState<Meal>(meal);
  const [q, setQ] = useState(''); const [sec, setSec] = useState<{ ad: string; per100: Nut; gram: number } | null>(null);
  const [gram, setGram] = useState(100);
  const baslat = (ad: string, per100: Nut, g: number) => { setSec({ ad, per100, gram: g }); setGram(g); };
  const kaydet = () => {
    if (!sec || !(gram > 0)) return;
    ekle({ id: uid(), date: date ?? today(), meal: ogun, ad: sec.ad, gram, ...scale(sec.per100, true, gram) });
    kapat();
  };
  return (
    <Sheet baslik="Yiyecek ekle" kapat={kapat}>
      <div className="seg">{MEALS.map(m => <button key={m.id} className={ogun === m.id ? 'on' : ''} onClick={() => setOgun(m.id)}>{m.ikon} {m.ad.split(' ')[0]}</button>)}</div>
      {!sec && <>
        <div className="seg">{(['ara', 'barkod', 'manuel'] as const).map(s => <button key={s} className={sek === s ? 'on' : ''} onClick={() => setSek(s)}>{s === 'ara' ? '🔎 Ara' : s === 'barkod' ? '▮▯ Barkod' : '✍️ Elle'}</button>)}</div>
        {sek === 'ara' && <>
          <input className="inp" placeholder="Yiyecek ara (örn. menemen, pilav)" value={q} onChange={e => setQ(e.target.value)} autoFocus />
          <ul className="list">{searchFoods(q).map(f => <li key={f.id} onClick={() => baslat(f.ad, f, f.gram)}><span>{f.ad}<small>{f.kat} · {f.gram} g porsiyon</small></span><b>{f.kcal}<small>kcal/100g</small></b></li>)}
            {q && searchFoods(q).length === 0 && <li className="muted">Bulunamadı. "Elle" sekmesinden ekleyebilirsin.</li>}</ul></>}
        {sek === 'barkod' && <Barkod sec={(u) => baslat(`${u.ad}${u.marka ? ' – ' + u.marka : ''}`, { kcal: u.kcal ?? 0, p: u.p ?? 0, c: u.c ?? 0, f: u.f ?? 0, lif: u.lif, seker: u.seker, tuz: u.tuz }, 100)} />}
        {sek === 'manuel' && <Manuel tamam={(ad, n) => baslat(ad, n, 100)} />}
      </>}
      {sec && <div>
        <h3>{sec.ad}</h3>
        <label className="lbl">Miktar (gram)</label>
        <div className="row"><button className="btn sm" onClick={() => setGram(Math.max(10, gram - 10))}>−</button>
          <input className="inp" type="number" inputMode="decimal" min={1} value={gram} onChange={e => setGram(+e.target.value)} />
          <button className="btn sm" onClick={() => setGram(gram + 10)}>+</button></div>
        <Ozet n={scale(sec.per100, true, gram || 0)} />
        <div className="row"><button className="btn ghost" onClick={() => setSec(null)}>Geri</button><button className="btn" onClick={kaydet} disabled={!(gram > 0)}>Ekle</button></div>
      </div>}
    </Sheet>
  );
}
export const Ozet = ({ n }: { n: Nut }) => (
  <div className="ozet"><div className="big">{Math.round(n.kcal)}<small> kcal</small></div>
    <div className="grid4"><span>Protein<b>{f1(n.p)} g</b></span><span>Karb.<b>{f1(n.c)} g</b></span><span>Yağ<b>{f1(n.f)} g</b></span><span>Lif<b>{f1(n.lif)} g</b></span><span>Şeker<b>{f1(n.seker)} g</b></span><span>Tuz<b>{f1(n.tuz)} g</b></span></div></div>
);
function Manuel({ tamam }: { tamam: (ad: string, n: Nut) => void }) {
  const [ad, setAd] = useState(''); const [v, setV] = useState({ kcal: '', p: '', c: '', f: '' });
  const ok = ad.trim() && +v.kcal >= 0 && v.kcal !== '';
  return (<div>
    <p className="muted">100 gram için besin değerlerini gir (paket üzerinde yazar).</p>
    <input className="inp" placeholder="Yiyecek adı" value={ad} onChange={e => setAd(e.target.value)} />
    <div className="grid2">{([['kcal', 'Kalori (kcal)'], ['p', 'Protein (g)'], ['c', 'Karbonhidrat (g)'], ['f', 'Yağ (g)']] as const).map(([k, l]) =>
      <input key={k} className="inp" type="number" inputMode="decimal" placeholder={l} value={v[k]} onChange={e => setV({ ...v, [k]: e.target.value })} />)}</div>
    <button className="btn" disabled={!ok} onClick={() => tamam(ad.trim(), { kcal: +v.kcal, p: +v.p || 0, c: +v.c || 0, f: +v.f || 0 })}>Devam</button></div>);
}
function Barkod({ sec }: { sec: (u: UrunBilgi) => void }) {
  const video = useRef<HTMLVideoElement>(null); const stream = useRef<MediaStream | null>(null);
  const [kod, setKod] = useState(''); const [durum, setDurum] = useState(''); const [u, setU] = useState<UrunBilgi | null>(null); const [tara, setTara] = useState(false);
  const destek = typeof window !== 'undefined' && 'BarcodeDetector' in window;
  const durdur = () => { stream.current?.getTracks().forEach(t => t.stop()); stream.current = null; setTara(false); };
  useEffect(() => durdur, []);
  const ara = async (k: string) => {
    setDurum('Aranıyor…'); setU(null);
    try { const r = await barkodAra(k.trim()); if (!r) setDurum('Ürün Open Food Facts veritabanında bulunamadı. "Elle" sekmesinden ekleyebilirsin.'); else { setU(r); setDurum(''); } }
    catch (e) { setDurum('Ürün servisine ulaşılamadı (' + ((e as Error).message || 'bağlantı hatası') + '). İnterneti kontrol edip tekrar dene.'); }
  };
  const baslat = async () => {
    try {
      setDurum('Kamera açılıyor…');
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setTara(true); setDurum('Barkodu çerçeveye getir…');
      await new Promise(r => setTimeout(r, 50)); const v = video.current!; v.srcObject = stream.current; await v.play();
      const det = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
      const dongu = async () => {
        if (!stream.current) return;
        try { const r = await det.detect(v); if (r.length) { const k = r[0].rawValue; durdur(); setKod(k); ara(k); return; } } catch { /* sonraki kare */ }
        setTimeout(dongu, 250);
      }; dongu();
    } catch { durdur(); setDurum('Kamera izni verilmedi veya kamera açılamadı. Tarayıcı ayarlarından izin ver veya barkod numarasını elle yaz.'); }
  };
  return (<div>
    {destek ? (tara ? <><video ref={video} className="vid" playsInline muted /><button className="btn ghost" onClick={durdur}>Taramayı durdur</button></> : <button className="btn" onClick={baslat}>📷 Kamerayla tara</button>)
      : <p className="muted">Bu tarayıcı kamerayla barkod okumayı desteklemiyor. Barkod numarasını elle yazabilirsin.</p>}
    <div className="row"><input className="inp" inputMode="numeric" placeholder="Barkod numarası" value={kod} onChange={e => setKod(e.target.value.replace(/\D/g, ''))} />
      <button className="btn sm" disabled={kod.length < 8} onClick={() => ara(kod)}>Ara</button></div>
    {durum && <p className="muted">{durum}</p>}
    {u && <div className="card">{u.foto && <img src={u.foto} alt={u.ad} className="urun" />}<h3>{u.ad}</h3><p className="muted">{u.marka}</p>
      <Ozet n={{ kcal: u.kcal ?? 0, p: u.p ?? 0, c: u.c ?? 0, f: u.f ?? 0, lif: u.lif, seker: u.seker, tuz: u.tuz }} /><p className="muted">100 g için değerler. {u.kcal === undefined && 'Bu üründe kalori bilgisi yok.'}</p>
      {u.icindekiler && <details><summary>İçindekiler</summary><p className="muted">{u.icindekiler}</p></details>}
      {u.alerjen && <p><b>Alerjenler:</b> {u.alerjen}</p>}
      <button className="btn" onClick={() => sec(u)}>Bu ürünü ekle</button></div>}
  </div>);
}
export { FOODS };
export type { Food };
