import type { AppState } from './types';
import { today } from './types';
// Su hatırlatma saatleri ve her seferde içilecek miktar
export function hatirlatmaSaatleri(s: AppState): number[] {
  const out: number[] = []; for (let h = s.suBas; h <= s.suBit; h += Math.max(1, s.suAralik)) out.push(h); return out;
}
export function sonrakiMiktar(s: AppState, saat: number): number {
  const kalanSaatler = hatirlatmaSaatleri(s).filter(h => h >= saat).length || 1;
  const kalan = Math.max(0, s.waterGoal - (s.water[today()] ?? 0));
  return Math.max(100, Math.min(600, Math.round(kalan / kalanSaatler / 50) * 50));
}
export async function bildir(baslik: string, govde: string) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) { await reg.showNotification(baslik, { body: govde, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'su', requireInteraction: false } as NotificationOptions); return; }
    new Notification(baslik, { body: govde });
  } catch { /* bildirim desteklenmiyor */ }
}
const gonderildi = new Set<string>();
// Dakikada bir çağrılır; uygulama (veya tarayıcı sekmesi) canlıyken, saati gelen hatırlatmayı bir kez gönderir.
export function kontrolEt(s: AppState) {
  if (!s.hatirlatma || !('Notification' in window) || Notification.permission !== 'granted') return;
  const d = new Date(); const saat = d.getHours(); if (d.getMinutes() > 10) return;
  const anahtar = `${today()}-${saat}`; if (gonderildi.has(anahtar)) return;
  if (!hatirlatmaSaatleri(s).includes(saat)) return;
  const icilen = s.water[today()] ?? 0; if (icilen >= s.waterGoal) return;
  gonderildi.add(anahtar);
  const m = sonrakiMiktar(s, saat);
  bildir('💧 Su içme zamanı', `Şimdi ${m} ml su içmelisin. Bugün ${icilen}/${s.waterGoal} ml içtin.`);
}
