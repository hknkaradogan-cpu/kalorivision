// Her yeni sürümde SURUM'u artır ve public/version.json içindeki "surum" değerini aynı yap.
export const SURUM = 2;
export const SURUM_URL = 'https://hknkaradogan-cpu.github.io/kalorivision/version.json';
export interface Guncelleme { surum: number; apk: string; not: string }
export async function guncellemeVarMi(): Promise<Guncelleme | null> {
  try {
    const r = await fetch(SURUM_URL + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return null;
    const j = (await r.json()) as Guncelleme; return j.surum > SURUM ? j : null;
  } catch { return null; }
}
export async function guncelle(g: Guncelleme) {
  if ((window as any).Capacitor?.isNativePlatform?.()) { const { Browser } = await import('@capacitor/browser'); await Browser.open({ url: g.apk }); }
  else location.reload();
}
