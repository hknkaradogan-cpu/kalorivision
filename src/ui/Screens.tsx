import React, { useMemo, useRef, useState } from 'react';
import { AppState, Entry, Meal, MEALS, Nut, Profile, scale, sum, today } from '../lib/types';
import { AKTIVITE, adimKcal, hedefler, suHedefi } from '../lib/calc';
import { hatirlatmaSaatleri, sonrakiMiktar } from '../lib/hatirlat';
import { DIYABET_UYARI, HAMILE_UYARI, KARB_UYARI_ESIK, diyabetRehberi, hamileAyRehberi } from '../data/rehber';
import { Bar, Donut, Line, Ring, Sheet, f1 } from './widgets';
import { AddFood, Ozet } from './AddFood';
import { Food } from '../data/foods';
import { Tahmin, yemekTani } from '../lib/vision';
import { oner } from '../lib/oneri';
import { cevapla } from '../lib/asistan';
import { yzAcik, yzSor } from '../lib/yz';
import { Tarif } from '../data/tarifler';

interface P { adimDurum?: string; s: AppState; set: (f: (s: AppState) => AppState) => void; git: (t: string) => void; ekleAc: (m: Meal) => void }
const gunKcal = (es: Entry[]) => sum(es);

export function Home({ s, set, git, ekleAc, adimDurum }: P) {
  const p = s.profile; const h = p ? hedefler(p) : undefined; const es = s.entries.filter(e => e.date === today()); const t = sum(es);
  const su = s.water[today()] ?? 0; const [acikOgun, setAcikOgun] = useState<Meal | null>(null);
  const suEkle = (ml: number) => set(x => ({ ...x, water: { ...x.water, [today()]: Math.max(0, (x.water[today()] ?? 0) + ml) } }));
  return (<div className="page">
    <div className="topbar"><span className="logo">🍏</span><div><b className="brand">Kalori<span>Vision</span> AI</b><small>Merhaba{p?.ad ? `, ${p.ad}` : ''} 👋</small></div></div>
    {!p && <div className="card warn"><b>Önce profilini oluştur</b><p>Kişisel kalori hedefin için yaş, boy ve kilonu gir.</p><button className="btn" onClick={() => git('profil')}>Profili doldur</button></div>}
    <div className="card hero center">
      <Ring value={t.kcal} max={h?.kcal ?? 0} label={`${Math.round(t.kcal)}`} sub={h ? `/ ${h.kcal.toLocaleString('tr-TR')} kcal` : 'kcal'} ikon="🔥" />
      {h && <p className="kalan">{t.kcal > h.kcal ? <>Hedefi <b className="rd">{Math.round(t.kcal - h.kcal)} kcal</b> aştın</> : <>Kalan<br /><b>{Math.round(h.kcal - t.kcal).toLocaleString('tr-TR')} kcal</b></>}</p>}
      {h && <div className="chips3">{([['💪', 'Protein', t.p, h.p, 'p'], ['🌾', 'Karbonhidrat', t.c, h.c, 'c'], ['💧', 'Yağ', t.f, h.f, 'f']] as const).map(([ik, ad, v, mx, k]) => <div key={ad} className={'mchip ' + k}><span className="mi">{ik}</span><small>{ad}</small><b>{Math.round(v)}g</b><em>%{mx ? Math.round((v / mx) * 100) : 0}</em></div>)}</div>}
    </div>
    <button className="cam-btn" onClick={() => git('kamera')}>📷 Yemek Tanı</button>
    {p && <div className="card"><h3>👟 Adım ve yakılan kalori</h3>
      {(() => { const adim = s.steps[today()] ?? 0; const yak = adimKcal(adim, p.kilo); const eksik = h ? Math.round(h.kcal + yak - t.kcal) : 0; const o = h ? oner(eksik, h.p - t.p, p).slice(0, 3) : [];
        return <><div className="grid4"><span>Adım<b>{adim}</b></span><span>Yakılan<b>{yak} kcal</b></span><span>Eksik kalori<b>{Math.max(0, eksik)} kcal</b></span></div>
          <div className="row"><button className="btn sm ghost" onClick={() => { const v = prompt('Bugünkü toplam adım sayını yaz'); const n = parseInt(v ?? '', 10); if (n >= 0 && n < 100000) set(x => ({ ...x, steps: { ...x.steps, [today()]: n } })); }}>Adımı elle gir</button></div>
          {adimDurum === 'yok' && <p className="muted small">Bu cihaz adım sensörünü desteklemiyor, adımı elle girebilirsin.</p>}
          {adimDurum === 'izinsiz' && <p className="muted small">Hareket sensörü izni verilmedi.</p>}
          <p className="muted small">Adımlar telefon hareket sensöründen sayılır ve yalnızca uygulama açıkken sayar; değer yaklaşıktır (arka planda sayma APK sürümünde olacak).</p>
          {t.kcal > 0 || adim > 0 ? (eksik > 80 ? <><p><b>Eksik {eksik} kcal'i tamamlamak için:</b></p>{o.map(r => <p key={r.id} className="small">{r.emoji} {r.ad} – {r.kcal} kcal, protein {r.p} g</p>)}</> : <p className="ok">Bugünkü hedefine yakınsın 👏</p>) : null}</>; })()}</div>}
    <div className="sec-h"><h3>Günlük Öğünler</h3></div>
    <div className="tiles">{MEALS.map(m => { const l = es.filter(e => e.meal === m.id); const k = Math.round(sum(l).kcal); return (
      <button key={m.id} className={'tile ' + m.id} onClick={() => setAcikOgun(m.id)}><span className="ti">{m.ikon}</span><b>{m.ad.replace(' yemeği', ' Yemeği').replace('Ara öğün', 'Ara Öğün')}</b><span>{k ? `${k} kcal` : '– kcal'}</span></button>); })}</div>
    {acikOgun && <Sheet baslik={MEALS.find(m => m.id === acikOgun)!.ad} kapat={() => setAcikOgun(null)}>
      {es.filter(e => e.meal === acikOgun).map(e => <div key={e.id} className="kayit"><span>{e.ad}<small>{e.gram ? `${e.gram} g` : 'porsiyon'}</small></span><b>{Math.round(e.kcal)} kcal</b>
        <button className="x" onClick={() => set(x => ({ ...x, entries: x.entries.filter(y => y.id !== e.id) }))} aria-label="Sil">🗑</button></div>)}
      {!es.some(e => e.meal === acikOgun) && <p className="muted">Bu öğüne henüz bir şey eklenmedi.</p>}
      <button className="btn" onClick={() => { const m = acikOgun; setAcikOgun(null); ekleAc(m); }}>＋ Yiyecek ekle</button></Sheet>}
    <div className="card"><h3>💧 Su</h3><div className="su"><b>{su} ml</b><span className="muted"> / {s.waterGoal} ml</span></div>
      <div className="bar-t"><div className="bar-f" style={{ width: `${Math.min(100, (su / s.waterGoal) * 100)}%`, background: 'var(--c2)' }} /></div>
      {s.hatirlatma && <p className="muted small">Sıradaki hatırlatmada yaklaşık {sonrakiMiktar(s, new Date().getHours())} ml içmelisin.</p>}
      <div className="row"><button className="btn sm" onClick={() => suEkle(200)}>+1 bardak (200)</button><button className="btn sm" onClick={() => suEkle(500)}>+500 ml</button><button className="btn sm ghost" onClick={() => suEkle(-200)}>−200</button></div></div>
  </div>);
}

export function Kamera({ s, set, git }: P) {
  const [img, setImg] = useState<string | null>(null); const [dur, setDur] = useState(''); const [hata, setHata] = useState('');
  const [liste, setListe] = useState<{ food: Food; gram: number; sec: boolean; skor: number }[] | null>(null);
  const [ogun, setOgun] = useState<Meal>('ogle'); const [ekle, setEkle] = useState(false); const [tamam, setTamam] = useState(false);
  const cam = useRef<HTMLInputElement>(null), gal = useRef<HTMLInputElement>(null);
  const sec = (f?: File | null) => {
    if (!f) return; setListe(null); setHata(''); setTamam(false);
    const url = URL.createObjectURL(f); setImg(url); setDur('Fotoğraf inceleniyor…');
    const im = new Image(); im.onload = async () => {
      try { const t: Tahmin[] = await yemekTani(im, setDur); setListe(t.map(x => ({ food: x.food, gram: x.food.gram, sec: true, skor: x.skor }))); setDur(''); if (!t.length) setHata('Yemek tanınamadı. Fotoğrafı daha yakından çekmeyi dene veya aşağıdan elle ara.'); }
      catch (e) { console.error(e); setDur(''); setHata('Yemek tanıma modeli yüklenemedi. İlk kullanımda model için internet gerekir. Elle aramayı kullanabilirsin.'); }
    }; im.onerror = () => { setDur(''); setHata('Fotoğraf açılamadı.'); }; im.src = url;
  };
  const secili = (liste ?? []).filter(x => x.sec); const toplam = sum(secili.map(x => scale(x.food, true, x.gram)));
  const hepsiEkle = () => { set(x => ({ ...x, entries: [...x.entries, ...secili.map(y => ({ id: Math.random().toString(36).slice(2), date: today(), meal: ogun, ad: y.food.ad, gram: y.gram, ...scale(y.food, true, y.gram) }))] })); setTamam(true); };
  return (<div className="page"><h1>Yemek tanıma</h1>
    <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={e => { sec(e.target.files?.[0]); e.target.value = ''; }} />
    <input ref={gal} type="file" accept="image/*" hidden onChange={e => { sec(e.target.files?.[0]); e.target.value = ''; }} />
    <div className="row"><button className="btn" onClick={() => cam.current?.click()}>📷 Fotoğraf çek</button><button className="btn ghost" onClick={() => gal.current?.click()}>🖼️ Galeriden seç</button></div>
    <p className="muted small">Fotoğraf cihazında işlenir, dışarı gönderilmez. İlk kullanımda yapay zekâ modeli indirilir (internet gerekir).</p>
    {!img && <div className="scan"><i className="c1" /><i className="c2" /><i className="c3" /><i className="c4" /><span>🍽️</span><p>Yemeğini çerçevenin içine al</p></div>}
    {img && <div className="scan has"><img src={img} className="foto" alt="Seçilen yemek" /><i className="c1" /><i className="c2" /><i className="c3" /><i className="c4" /></div>}
    {dur && <div className="card center"><div className="spin" /><p><b>Fotoğraf analiz ediliyor…</b><br /><small>{dur}</small></p><div className="pbar"><i /></div></div>}
    {hata && <div className="card warn"><p>{hata}</p><button className="btn" onClick={() => ekleAc2(setEkle)}>Elle ara</button></div>}
    {liste && liste.length > 0 && <div className="card"><h3>Tanınan yiyecekler</h3>
      <p className="muted small">Bunlar <b>tahmindir</b>. Doğru değilse işareti kaldır; gramajı sen düzelt. Porsiyon fotoğraftan kesin hesaplanamaz.</p>
      {liste.map((x, i) => <div key={x.food.id} className="tani"><label><span className="fe">{emojiOf(x.food.kat)}</span><input type="checkbox" checked={x.sec} onChange={e => setListe(liste.map((y, j) => j === i ? { ...y, sec: e.target.checked } : y))} /> {x.food.ad}<small> %{Math.round(Math.min(1, x.skor) * 100)} güven</small></label>
        <div className="row"><input className="inp g" type="number" inputMode="decimal" value={x.gram} min={1} onChange={e => setListe(liste.map((y, j) => j === i ? { ...y, gram: +e.target.value } : y))} /><span>g</span><b>{Math.round(scale(x.food, true, x.gram || 0).kcal)} kcal</b></div></div>)}
      <div className="total"><span>🔥</span><b>Toplam Kalori</b><em>{Math.round(toplam.kcal)} kcal</em></div><div className="row donutrow"><Donut p={toplam.p} c={toplam.c} f={toplam.f} /><div className="grow small">{(() => { const tt = toplam.p * 4 + toplam.c * 4 + toplam.f * 9 || 1; return <><p><span className="dot p" />Protein <b>%{Math.round(toplam.p * 4 / tt * 100)}</b></p><p><span className="dot c" />Karbonhidrat <b>%{Math.round(toplam.c * 4 / tt * 100)}</b></p><p><span className="dot f" />Yağ <b>%{Math.round(toplam.f * 9 / tt * 100)}</b></p></>; })()}</div></div>
      <div className="seg">{MEALS.map(m => <button key={m.id} className={ogun === m.id ? 'on' : ''} onClick={() => setOgun(m.id)}>{m.ikon}</button>)}</div>
      {tamam ? <><p className="ok">✓ Kaydedildi</p><button className="btn" onClick={() => git('ana')}>Ana sayfaya git</button></> : <button className="btn" disabled={!secili.length} onClick={hepsiEkle}>✓ Kaydet</button>}
      <div className="row"><button className="btn ghost" onClick={() => { setImg(null); setListe(null); setTamam(false); cam.current?.click(); }}>🔄 Tekrar Tara</button><button className="btn ghost" onClick={() => setEkle(true)}>＋ Eksik yiyecek</button></div></div>}
    {!img && <button className="btn ghost" onClick={() => setEkle(true)}>Elle ara / barkod</button>}
    {ekle && <AddFood meal={ogun} kapat={() => setEkle(false)} ekle={e => set(x => ({ ...x, entries: [...x.entries, e] }))} />}
  </div>);
}
const emojiOf = (k: string) => ({ 'Kahvaltı': '🍳', 'Fırın': '🥐', 'Hamur işi': '🥟', 'Et': '🍗', 'Yemek': '🍛', 'Çorba': '🥣', 'Zeytinyağlı': '🥬', 'Fast food': '🍔', 'Meze': '🥙', 'Salata': '🥗', 'Süt': '🥛', 'İçecek': '🥤', 'Tatlı': '🍰', 'Atıştırmalık': '🍪', 'Meyve': '🍎', 'Sebze': '🥦', 'Kuruyemiş': '🥜', 'Dünya': '🍣' } as Record<string, string>)[k] ?? '🍽️';
const ekleAc2 = (f: (b: boolean) => void) => f(true);

export function Beslenme({ s, set }: P) {
  const p = s.profile; const h = p ? hedefler(p) : undefined; const t = sum(s.entries.filter(e => e.date === today()));
  const [acik, setAcik] = useState<Tarif | null>(null); const [ekle, setEkle] = useState<Meal | null>(null);
  const [sor, setSor] = useState(''); const [sohbet, setSohbet] = useState<{ k: boolean; m: string }[]>([]);
  const [bekle, setBekle] = useState(false);
  const gonder = async (q: string) => { if (!q.trim() || bekle) return; const yeni = [...sohbet, { k: true, m: q }]; setSor('');
    if (!yzAcik()) { setSohbet([...yeni, { k: false, m: cevapla(q, s.entries, s.water, p) }]); return; }
    setSohbet(yeni); setBekle(true);
    try { const c = await yzSor(yeni, s); setSohbet([...yeni, { k: false, m: c }]); } catch (e) { setSohbet([...yeni, { k: false, m: 'Asistana ulaşılamadı (' + (e as Error).message + '). Cihaz içi cevap:\n' + cevapla(q, s.entries, s.water, p) }]); } finally { setBekle(false); } };
  const oneriler = oner(h ? h.kcal - t.kcal : 500, h ? h.p - t.p : 0, p);
  return (<div className="page"><h1>Beslenme</h1>
    <div className="card"><h3>Yemek ara ve ekle</h3><div className="row wrap">{MEALS.map(m => <button key={m.id} className="btn sm" onClick={() => setEkle(m.id)}>{m.ikon} {m.ad.split(' ')[0]}</button>)}</div></div>
    <div className="card"><h3>Akıllı öneriler</h3><p className="muted small">{h ? `Kalan ${Math.round(h.kcal - t.kcal)} kcal, ${Math.max(0, Math.round(h.p - t.p))} g protein için` : 'Genel öneriler (profil doldurursan kişiselleşir)'}</p>
      {oneriler.map(r => <div key={r.id} className="tarif" onClick={() => setAcik(acik?.id === r.id ? null : r)}><div className="row"><span className="em">{r.emoji}</span><span className="grow"><b>{r.ad}</b><small>{r.porsiyon} · P {r.p} K {r.c} Y {r.f}</small></span><b>{r.kcal}</b></div>
        {acik?.id === r.id && <div className="det"><b>Malzemeler</b><ul>{r.malzeme.map(m => <li key={m}>{m}</li>)}</ul><b>Hazırlanışı</b><ol>{r.yapilis.map(m => <li key={m}>{m}</li>)}</ol>
          <button className="btn sm" onClick={e => { e.stopPropagation(); set(x => ({ ...x, entries: [...x.entries, { id: Math.random().toString(36).slice(2), date: today(), meal: 'ogle', ad: r.ad, gram: 0, kcal: r.kcal, p: r.p, c: r.c, f: r.f }] })); }}>Öğle yemeğine ekle</button></div>}</div>)}
      <p className="muted small">Değerler yaklaşık hesaplanmıştır. Tarif görselleri yerine simge kullanılır.</p></div>
    {p?.hamile && p.cinsiyet === 'k' && <div className="card"><h3>🤰 Hamilelik rehberi</h3><p className="small muted">{HAMILE_UYARI}</p>{hamileAyRehberi(p.hamileAy ?? 1).map(b => <div key={b.baslik}><b>{b.baslik}</b><ul className="small">{b.maddeler.map(m => <li key={m}>{m}</li>)}</ul></div>)}</div>}
    {p?.diyabet && <div className="card"><h3>🩸 Diyabet rehberi</h3><p className="small muted">{DIYABET_UYARI}</p>{(() => { const ogunKarb = MEALS.map(m => ({ m, k: sum(s.entries.filter(e => e.date === today() && e.meal === m.id)).c })).filter(x => x.k > KARB_UYARI_ESIK); return ogunKarb.length ? <p className="warnx">⚠️ {ogunKarb.map(x => `${x.m.ad}: ${Math.round(x.k)} g karbonhidrat`).join(', ')} – bir öğün için yüksek olabilir ({KARB_UYARI_ESIK} g referans). Doktorunun belirlediği miktara bak.</p> : null; })()}{diyabetRehberi.map(b => <div key={b.baslik}><b>{b.baslik}</b><ul className="small">{b.maddeler.map(m => <li key={m}>{m}</li>)}</ul></div>)}</div>}
    <div className="card"><div className="bot"><span className="botav">🤖</span><div><b>Beslenme Asistanı</b><small className="onl">● Çevrimiçi</small></div></div><div className="chat">{sohbet.map((c, i) => <div key={i} className={c.k ? 'm me' : 'm'}>{c.m}</div>)}</div>
      <div className="row wrap">{['Bugün kaç kalori aldım?', 'Akşam ne yemeliyim?', 'Protein ihtiyacımı karşılıyor muyum?', 'Bugünkü beslenmem dengeli mi?'].map(q => <button key={q} className="chip" onClick={() => gonder(q)}>{q}</button>)}</div>
      {bekle && <p className="muted small">Asistan yazıyor…</p>}<form className="row" onSubmit={e => { e.preventDefault(); gonder(sor); }}><input className="inp" value={sor} onChange={e => setSor(e.target.value)} placeholder="Bir soru yaz…" /><button className="btn sm">Gönder</button></form>
      <p className="muted small">{yzAcik() ? 'Sorduğun soru ve günlük özetin yapay zekâ servisine gönderilir. ' : 'Asistan cihazında çalışır. '}Tıbbi teşhis koymaz.</p></div>
    {ekle && <AddFood meal={ekle} kapat={() => setEkle(null)} ekle={e => set(x => ({ ...x, entries: [...x.entries, e] }))} />}
  </div>);
}

export function Istatistik({ s, set }: P) {
  const p = s.profile; const h = p ? hedefler(p) : undefined; const [aralik, setAralik] = useState<'h' | 'a' | 'y'>('h');
  const gunler = useMemo(() => Array.from({ length: aralik === 'h' ? 7 : aralik === 'a' ? 30 : 12 }, (_, i) => { const n = aralik === 'h' ? 7 : aralik === 'a' ? 30 : 12; const d = new Date(); if (aralik === 'y') d.setMonth(d.getMonth() - (n - 1 - i), 1); else d.setDate(d.getDate() - (n - 1 - i)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }), [aralik]);
  const veri = gunler.map(g => aralik === 'y' ? { g, k: (() => { const ay = g.slice(0, 7); const gl = new Set(s.entries.filter(e => e.date.startsWith(ay)).map(e => e.date)); return gl.size ? Math.round(gunKcal(s.entries.filter(e => e.date.startsWith(ay))).kcal / gl.size) : 0; })(), su: 0 } : { g, k: Math.round(gunKcal(s.entries.filter(e => e.date === g)).kcal), su: s.water[g] ?? 0 });
  const max = Math.max(...veri.map(v => v.k), h?.kcal ?? 0, 1); const [kg, setKg] = useState('');
  const w = [...s.weights].sort((a, b) => a.date.localeCompare(b.date)); const ilk = w[0]?.kg ?? p?.kilo; const son = w[w.length - 1]?.kg ?? p?.kilo;
  const hafta = (() => { if (w.length < 2) return undefined; const sonT = new Date(w[w.length - 1].date).getTime(); const eski = [...w].reverse().find(x => sonT - new Date(x.date).getTime() >= 6 * 864e5); return eski ? Math.round((son! - eski.kg) * 10) / 10 : undefined; })();
  const bugun = sum(s.entries.filter(e => e.date === today()));
  return (<div className="page"><h1>İstatistik</h1>
    <div className="seg tabs">{([['h', 'Haftalık'], ['a', 'Aylık'], ['y', 'Yıllık']] as const).map(([k, l]) => <button key={k} className={aralik === k ? 'on' : ''} onClick={() => setAralik(k)}>{l}</button>)}</div>
    <div className="card"><h3>Kalori Grafiği {aralik === 'y' && <small>(aylık günlük ortalama)</small>}</h3><div className="cols">{veri.map(v => <div key={v.g} className="col"><div className="col-b"><div style={{ height: `${(v.k / max) * 100}%` }} className={h && v.k > h.kcal ? 'over' : ''} /></div><small>{aralik === 'y' ? v.g.slice(5, 7) : v.g.slice(8)}</small>{aralik !== 'a' && <small>{v.k}</small>}</div>)}</div>
      {h && <p className="muted small">Günlük hedef: {h.kcal} kcal</p>}</div>
    <div className="card"><h3>Bugünün makroları</h3><div className="row"><Donut p={bugun.p} c={bugun.c} f={bugun.f} /><div className="grow small"><p><span className="dot p" />Protein {f1(bugun.p)} g</p><p><span className="dot c" />Karbonhidrat {f1(bugun.c)} g</p><p><span className="dot f" />Yağ {f1(bugun.f)} g</p><p>Lif {f1(bugun.lif)} g · Şeker {f1(bugun.seker)} g · Tuz {f1(bugun.tuz)} g</p></div></div></div>
    <div className="card"><h3>💧 Su (son 7 gün)</h3><div className="cols">{veri.map(v => <div key={v.g} className="col"><div className="col-b"><div style={{ height: `${Math.min(100, (v.su / s.waterGoal) * 100)}%`, background: 'var(--c2)' }} /></div><small>{v.g.slice(8)}</small><small>{v.su}</small></div>)}</div></div>
    <div className="card"><h3>⚖️ Kilo takibi</h3>
      <div className="grid4"><span>Başlangıç<b>{ilk ?? '—'} kg</b></span><span>Güncel<b>{son ?? '—'} kg</b></span><span>Hedef<b>{p?.hedefKilo ?? '—'} kg</b></span><span>Değişim<b>{ilk && son ? (Math.round((son - ilk) * 10) / 10) : '—'} kg</b></span><span>Haftalık<b>{hafta ?? '—'} kg</b></span></div>
      <Line data={w.map(x => ({ x: x.date.slice(5), y: x.kg }))} hedef={p?.hedefKilo} birim="kg" />
      <form className="row" onSubmit={e => { e.preventDefault(); const v = parseFloat(kg.replace(',', '.')); if (v > 20 && v < 400) { set(x => ({ ...x, weights: [...x.weights.filter(y => y.date !== today()), { date: today(), kg: v }], profile: x.profile ? { ...x.profile, kilo: v } : x.profile })); setKg(''); } }}>
        <input className="inp" inputMode="decimal" placeholder="Bugünkü kilo (kg)" value={kg} onChange={e => setKg(e.target.value)} /><button className="btn sm">Kaydet</button></form></div>
  </div>);
}

export function ProfilEkrani({ s, set }: P) {
  const bos: Profile = { ad: '', yas: 30, boy: 170, kilo: 70, cinsiyet: 'k', aktivite: 1.375, hedefKilo: 65, hedef: 'ver', alerjiler: '', tercih: '' };
  const [p, setP] = useState<Profile>(s.profile ?? bos); const [kayit, setKayit] = useState(false); const [sil, setSil] = useState(false);
  const h = hedefler(p); const gecerli = p.yas >= 18 && p.yas <= 100 && p.boy >= 100 && p.boy <= 230 && p.kilo >= 30 && p.kilo <= 300;
  const n = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: +e.target.value });
  const indir = () => { const b = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'kalorivision-verilerim.json'; a.click(); };
  const bildirim = async () => {
    if (!('Notification' in window)) return alert('Bu tarayıcı bildirimleri desteklemiyor.');
    const r = await Notification.requestPermission(); set(x => ({ ...x, hatirlatma: r === 'granted' }));
    if (r === 'granted') new Notification('KaloriVision', { body: 'Su hatırlatması açıldı. Uygulama açıkken hatırlatır.' });
  };
  return (<div className="page"><div className="avrow"><span className="avatar">{p.cinsiyet === 'k' ? '👩' : '👨'}</span><div><b>{p.ad || 'Profilim'}</b><small>Sağlıklı Yaşam Tutkunu</small></div></div>
    <div className="card"><label className="lbl">Adın</label><input className="inp" value={p.ad} onChange={e => setP({ ...p, ad: e.target.value })} />
      <div className="grid2"><div><label className="lbl">Yaş</label><input className="inp" type="number" inputMode="numeric" value={p.yas} onChange={n('yas')} /></div><div><label className="lbl">Boy (cm)</label><input className="inp" type="number" inputMode="numeric" value={p.boy} onChange={n('boy')} /></div>
        <div><label className="lbl">Kilo (kg)</label><input className="inp" type="number" inputMode="decimal" value={p.kilo} onChange={n('kilo')} /></div><div><label className="lbl">Hedef kilo</label><input className="inp" type="number" inputMode="decimal" value={p.hedefKilo} onChange={n('hedefKilo')} /></div></div>
      <label className="lbl">Cinsiyet</label><div className="seg"><button className={p.cinsiyet === 'k' ? 'on' : ''} onClick={() => setP({ ...p, cinsiyet: 'k' })}>Kadın</button><button className={p.cinsiyet === 'e' ? 'on' : ''} onClick={() => setP({ ...p, cinsiyet: 'e' })}>Erkek</button></div>
      {p.yas < 18 && <p className="warnx">Bu uygulama 18 yaş ve üzeri içindir. Daha genç kullanıcılar için kalori hedefi hesaplanmaz.</p>}
      {p.cinsiyet === 'k' && <div className="row"><label><input type="checkbox" checked={!!p.hamile} onChange={e => setP({ ...p, hamile: e.target.checked, hamileAy: p.hamileAy ?? 1 })} /> Hamileyim</label>{p.hamile && <select className="inp g" value={p.hamileAy ?? 1} onChange={e => setP({ ...p, hamileAy: +e.target.value })}>{[1,2,3,4,5,6,7,8,9].map(a => <option key={a} value={a}>{a}. ay</option>)}</select>}</div>}
      <div className="row"><label><input type="checkbox" checked={!!p.diyabet} onChange={e => setP({ ...p, diyabet: e.target.checked })} /> Şeker hastasıyım (diyabet)</label></div>
      <label className="lbl">Günlük hareket</label><select className="inp" value={p.aktivite} onChange={e => setP({ ...p, aktivite: +e.target.value })}>{AKTIVITE.map(a => <option key={a.v} value={a.v}>{a.ad}</option>)}</select>
      <label className="lbl">Hedef</label><div className="seg">{([['ver', 'Kilo ver'], ['koru', 'Koru'], ['al', 'Kilo al']] as const).map(([k, l]) => <button key={k} className={p.hedef === k ? 'on' : ''} onClick={() => setP({ ...p, hedef: k })}>{l}</button>)}</div>
      <label className="lbl">Alerjiler (virgülle: süt, yumurta, gluten…)</label><input className="inp" value={p.alerjiler} onChange={e => setP({ ...p, alerjiler: e.target.value })} />
      <label className="lbl">Beslenme tercihi (vejetaryen, vegan…)</label><input className="inp" value={p.tercih} onChange={e => setP({ ...p, tercih: e.target.value })} />
      {gecerli && <div className="ozet"><div className="grid2 small"><span>Bazal metabolizma<b>{h.bmr} kcal</b></span><span>Günlük ihtiyaç<b>{h.tdee} kcal</b></span><span>Günlük hedef<b>{h.kcal} kcal</b></span><span>P / K / Y<b>{h.p} / {h.c} / {h.f} g</b></span></div>{h.not && <p className="muted small">{h.not}</p>}</div>}
      <p className="muted small">Hamilelik, emzirme, hastalık veya özel diyet durumunda bir uzmana danışmadan bu hedefleri kullanma.</p>
      <button className="btn" disabled={!gecerli} onClick={() => { set(x => ({ ...x, profile: p, waterGoal: x.profile ? x.waterGoal : suHedefi(p), weights: x.weights.length ? x.weights : [{ date: today(), kg: p.kilo }] })); setKayit(true); setTimeout(() => setKayit(false), 1800); }}>Kaydet</button>{kayit && <p className="ok">✓ Kaydedildi</p>}</div>
    <div className="card"><h3>Su hedefi</h3><div className="row"><input className="inp" type="number" inputMode="numeric" value={s.waterGoal} onChange={e => set(x => ({ ...x, waterGoal: Math.max(500, +e.target.value || 2000) }))} /><span>ml</span></div>
      <div className="grid2"><div><label className="lbl">Başlangıç saati</label><select className="inp" value={s.suBas} onChange={e => set(x => ({ ...x, suBas: +e.target.value }))}>{Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}</select></div><div><label className="lbl">Bitiş saati</label><select className="inp" value={s.suBit} onChange={e => set(x => ({ ...x, suBit: +e.target.value }))}>{Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}</select></div></div>
      <label className="lbl">Kaç saatte bir</label><select className="inp" value={s.suAralik} onChange={e => set(x => ({ ...x, suAralik: +e.target.value }))}>{[1, 2, 3, 4].map(a => <option key={a} value={a}>{a} saat</option>)}</select>
      <p className="muted small">Hatırlatma saatleri: {hatirlatmaSaatleri(s).map(h => h + ':00').join(', ') || '—'}. Bildirim, uygulama açıkken veya arka plandaki sekmede gelir. Uygulama tamamen kapalıyken bildirim APK sürümünde yerel bildirimle çalışacak.</p>
      <button className="btn ghost" onClick={bildirim}>{s.hatirlatma ? '🔔 Hatırlatma açık' : '🔔 Su hatırlatmasını aç'}</button></div>
    <div className="card"><h3>Verilerim</h3><p className="muted small">Verilerin yalnızca bu telefonda saklanır; hiçbir sunucuya gönderilmez. Hesap sistemi bu sürümde yerel profil olarak çalışır.</p>
      <button className="btn ghost" onClick={indir}>Verilerimi indir (JSON)</button>
      {!sil ? <button className="btn danger" onClick={() => setSil(true)}>Hesabı ve tüm verileri sil</button> : <div><p><b>Tüm kayıtların kalıcı olarak silinecek. Emin misin?</b></p><div className="row"><button className="btn ghost" onClick={() => setSil(false)}>Vazgeç</button><button className="btn danger" onClick={() => { set(() => ({ entries: [], water: {}, waterGoal: 2000, weights: [], hatirlatma: false, steps: {}, suBas: 8, suBit: 22, suAralik: 2 })); setSil(false); }}>Evet, sil</button></div></div>}</div>
    <div className="card"><h3>Gizlilik ve bilgi</h3><p className="small muted">KaloriVision verilerini yalnızca cihazında saklar. Barkod araması Open Food Facts'e yalnızca barkod numarasını gönderir. Yemek tanıma fotoğrafı cihazında işlenir. Kalori ve porsiyon değerleri tahmindir, tıbbi tavsiye değildir.</p></div>
  </div>);
}
export { Ozet };
export type { Nut };
