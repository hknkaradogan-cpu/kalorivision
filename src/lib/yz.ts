import { ASISTAN_URL } from './ayar';
import { AppState, sum, today } from './types';
import { hedefler } from './calc';
export const yzAcik = () => !!ASISTAN_URL;
export function baglam(s: AppState): string {
  const p = s.profile; const t = sum(s.entries.filter(e => e.date === today()));
  const h = p ? hedefler(p) : undefined;
  return [p ? `Kullanıcı: ${p.yas} yaş, ${p.cinsiyet === 'k' ? 'kadın' : 'erkek'}, ${p.boy} cm, ${p.kilo} kg, hedef: ${p.hedef}${p.hamile ? `, hamile (${p.hamileAy}. ay)` : ''}${p.diyabet ? ', diyabet' : ''}${p.alerjiler ? ', alerji: ' + p.alerjiler : ''}` : 'Profil yok',
    h ? `Günlük hedef: ${h.kcal} kcal, protein ${h.p} g` : '', `Bugün: ${Math.round(t.kcal)} kcal, protein ${Math.round(t.p)} g, karb ${Math.round(t.c)} g, yağ ${Math.round(t.f)} g`,
    'Bugünkü yiyecekler: ' + s.entries.filter(e => e.date === today()).map(e => `${e.ad} ${Math.round(e.kcal)} kcal`).join(', '), `Adım: ${s.steps[today()] ?? 0}, su: ${s.water[today()] ?? 0} ml`].filter(Boolean).join('\n');
}
export async function yzSor(mesajlar: { k: boolean; m: string }[], s: AppState): Promise<string> {
  const r = await fetch(ASISTAN_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mesajlar, baglam: baglam(s) }), signal: AbortSignal.timeout(30000) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.hata || 'Asistan yanıt vermedi'); return j.cevap;
}
