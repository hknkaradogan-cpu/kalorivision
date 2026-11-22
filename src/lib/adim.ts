import { useEffect, useRef, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { today } from './types';
const Adim = registerPlugin<{ oku(): Promise<{ toplam: number }> }>('Adim');
// Telefonun ivmeölçeriyle adım sayar. SADECE uygulama/sekme açıkken çalışır (PWA sınırı).
// Arka planda sürekli adım sayma APK sürümünde (Health Connect / adım sensörü) eklenecek.
export function useAdimSayac(aktif: boolean, ekle: (n: number) => void, ayarla?: (n: number) => void) {
  const [destek, setDestek] = useState<'bilinmiyor' | 'var' | 'yok' | 'izinsiz'>('bilinmiyor');
  const son = useRef(0), mag = useRef(9.8), ref = useRef(ekle); ref.current = ekle;
  const yigin = useRef(0);
  useEffect(() => {
    if (!aktif) return;
    if (Capacitor.isNativePlatform() && ayarla) {
      // Donanım adım sayacı: gün başındaki değeri kaydeder, farkı bugünün adımı yapar (uygulama kapalıyken de sayılır).
      let dur = false;
      const oku = async () => {
        try {
          const { toplam } = await Adim.oku(); let baz = toplam; const k = 'adimBaz';
          try { const j = JSON.parse(localStorage.getItem(k) || 'null'); if (j && j.d === today() && j.b <= toplam) baz = j.b; else localStorage.setItem(k, JSON.stringify({ d: today(), b: toplam })); } catch { /* yoksay */ }
          if (!dur) { ayarla(Math.max(0, Math.round(toplam - baz))); setDestek('var'); }
        } catch (e) { if (!dur) setDestek(String((e as any)?.message ?? e).includes('izin') ? 'izinsiz' : 'yok'); }
      };
      oku(); const id = setInterval(oku, 10000); const vis = () => { if (!document.hidden) oku(); }; document.addEventListener('visibilitychange', vis);
      return () => { dur = true; clearInterval(id); document.removeEventListener('visibilitychange', vis); };
    }
    if (typeof DeviceMotionEvent === 'undefined') { setDestek('yok'); return; }
    const isle = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity; if (!a || a.x == null || a.y == null || a.z == null) return;
      const m = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z); mag.current = mag.current * 0.9 + m * 0.1;
      const fark = m - mag.current; const t = Date.now();
      if (fark > 1.6 && t - son.current > 350) { yigin.current++; son.current = t; }
      if (yigin.current >= 3) { ref.current(yigin.current); yigin.current = 0; }
    };
    const baslat = () => { window.addEventListener('devicemotion', isle); setDestek('var'); };
    const D: any = DeviceMotionEvent;
    if (typeof D.requestPermission === 'function') { D.requestPermission().then((r: string) => (r === 'granted' ? baslat() : setDestek('izinsiz'))).catch(() => setDestek('izinsiz')); }
    else baslat();
    return () => window.removeEventListener('devicemotion', isle);
  }, [aktif]);
  return destek;
}
