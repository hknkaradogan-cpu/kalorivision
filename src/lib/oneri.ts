import { TARIFLER, Tarif } from '../data/tarifler';
import type { Profile } from './types';
export function oner(kalanKcal: number, kalanP: number, p?: Profile): Tarif[] {
  const alerji = (p?.alerjiler ?? '').toLocaleLowerCase('tr'); const tercih = (p?.tercih ?? '').toLocaleLowerCase('tr');
  return TARIFLER.filter(t => !t.icerir.some(i => alerji.includes(i.replace('kuruyemis', 'fındık').slice(0, 4)) || alerji.includes(i)))
    .filter(t => !tercih.includes('vegan') || t.etiket.includes('vegan'))
    .filter(t => !tercih.includes('vejetaryen') || t.etiket.includes('vejetaryen') || t.etiket.includes('vegan'))
    .map(t => ({ t, puan: -Math.abs(Math.min(kalanKcal, 600) - t.kcal) / 10 + (kalanP > 25 ? t.p / 4 : 0) - (t.kcal > kalanKcal ? 100 : 0) }))
    .sort((a, b) => b.puan - a.puan).slice(0, 4).map(x => x.t);
}
