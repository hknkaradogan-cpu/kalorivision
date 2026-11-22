import type { Profile } from './types';
export const AKTIVITE = [
  { v: 1.2, ad: 'Hareketsiz (masa başı)' }, { v: 1.375, ad: 'Hafif (haftada 1-3 gün spor)' },
  { v: 1.55, ad: 'Orta (haftada 3-5 gün)' }, { v: 1.725, ad: 'Aktif (haftada 6-7 gün)' },
];
// Mifflin-St Jeor
export const bmr = (p: Profile) => 10 * p.kilo + 6.25 * p.boy - 5 * p.yas + (p.cinsiyet === 'e' ? 5 : -161);
export const tdee = (p: Profile) => bmr(p) * p.aktivite;
export const suHedefi = (p?: Profile) => (p ? Math.round((p.kilo * 35 + (p.hamile ? 300 : 0)) / 50) * 50 : 2000);
// Adım başına yaklaşık kcal (kilo ile orantılı; ~0,04 kcal/adım @70 kg)
export const adimKcal = (adim: number, kilo = 70) => Math.round(adim * 0.04 * (kilo / 70));
export interface Hedefler { kcal: number; p: number; c: number; f: number; bmr: number; tdee: number; not?: string }
export function hedefler(p: Profile): Hedefler {
  const t = tdee(p); const b = bmr(p);
  const hamile = !!p.hamile && p.cinsiyet === 'k';
  const hedef = hamile ? 'koru' : p.hedef; // hamilelikte kilo verme hedefi uygulanmaz
  let kcal = hedef === 'ver' ? t - 450 : hedef === 'al' ? t + 300 : t;
  if (hamile) { const ay = p.hamileAy ?? 1; kcal += ay <= 3 ? 0 : ay <= 6 ? 340 : 450; }
  const taban = p.cinsiyet === 'e' ? 1500 : 1200; let not: string | undefined;
  if (kcal < taban) { kcal = taban; not = `Güvenlik için günlük hedef en az ${taban} kcal olarak sabitlendi.`; }
  kcal = Math.round(kcal / 10) * 10;
  const protein = Math.round(p.kilo * (hedef === 'ver' ? 1.6 : 1.4)) + (hamile ? 15 : 0);
  const yag = Math.round((kcal * 0.30) / 9);
  let karb = Math.max(0, Math.round((kcal - protein * 4 - yag * 9) / 4));
  if (p.diyabet) karb = Math.min(karb, Math.round((kcal * 0.45) / 4)); // diyabette karbonhidratı sınırla
  return { kcal, p: protein, c: karb, f: yag, bmr: Math.round(b), tdee: Math.round(t), not };
}
