import { useEffect, useRef, useState } from 'react';
// Telefonun ivmeölçeriyle adım sayar. SADECE uygulama/sekme açıkken çalışır (PWA sınırı).
// Arka planda sürekli adım sayma APK sürümünde (Health Connect / adım sensörü) eklenecek.
export function useAdimSayac(aktif: boolean, ekle: (n: number) => void) {
  const [destek, setDestek] = useState<'bilinmiyor' | 'var' | 'yok' | 'izinsiz'>('bilinmiyor');
  const son = useRef(0), mag = useRef(9.8), ref = useRef(ekle); ref.current = ekle;
  const yigin = useRef(0);
  useEffect(() => {
    if (!aktif) return;
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
