import { Food } from '../data/foods';
import { ASISTAN_URL } from './ayar';
// Fotoğraf yapay zekâ servisine (Gemini) küçültülüp gönderilir; cevap birkaç saniyede gelir.
export type Ilerleme = (m: string) => void;
export interface Tahmin { food: Food; skor: number; gram: number }
function kucult(img: HTMLImageElement, max = 768): string {
  const o = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)); const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * o); c.height = Math.round(img.naturalHeight * o);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.8);
}
export async function yemekTani(img: HTMLImageElement, onP?: Ilerleme): Promise<Tahmin[]> {
  onP?.('Fotoğraf yapay zekâya gönderiliyor…');
  const r = await fetch(ASISTAN_URL.replace('kalori-asistan', 'kalori-foto'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resim: kucult(img) }), signal: AbortSignal.timeout(45000) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.hata || 'Servis yanıt vermedi (' + r.status + ')');
  return (j.yemekler as any[]).map((y, i) => ({
    food: { id: 'ai' + i + Date.now(), ad: y.ad, en: y.ad, kcal: y.kcal100, p: y.p100, c: y.c100, f: y.f100, gram: Math.round(y.gram), kat: 'Yemek' } as Food,
    skor: y.guven ?? 0.7, gram: Math.round(y.gram),
  }));
}
