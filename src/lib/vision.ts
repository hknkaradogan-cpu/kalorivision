import { FOODS, Food } from '../data/foods';
// Telefonda çalışan CLIP modeli (zero-shot). Ücretsiz, sunucu yok; ilk kullanımda model indirilir (~100-150 MB) ve tarayıcıda saklanır.
let pipePromise: Promise<any> | null = null;
export type Ilerleme = (m: string) => void;
async function getPipe(onP?: Ilerleme) {
  if (!pipePromise) {
    pipePromise = (async () => {
      const tf = await import('@huggingface/transformers');
      tf.env.allowLocalModels = false;
      return tf.pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
        progress_callback: (x: any) => { if (x?.status === 'progress' && onP) onP(`Model indiriliyor %${Math.round(x.progress ?? 0)}`); },
      });
    })().catch(e => { pipePromise = null; throw e; });
  }
  return pipePromise;
}
export interface Tahmin { food: Food; skor: number }
const ONEKI = (f: Food) => `a photo of ${f.en}`;
async function siniflandir(pipe: any, src: string): Promise<Tahmin[]> {
  const out = await pipe(src, FOODS.map(ONEKI));
  return out.map((o: any) => ({ food: FOODS.find(f => ONEKI(f) === o.label)!, skor: o.score })).filter((t: Tahmin) => t.food);
}
function kes(img: HTMLImageElement, x: number, y: number, w: number, h: number): string {
  const c = document.createElement('canvas'); c.width = 224; c.height = 224;
  c.getContext('2d')!.drawImage(img, img.naturalWidth * x, img.naturalHeight * y, img.naturalWidth * w, img.naturalHeight * h, 0, 0, 224, 224);
  return c.toDataURL('image/jpeg', 0.9);
}
// Tüm görüntü + 4 çeyrek: tabakta birden fazla yiyecek varsa her birini aday olarak çıkarır.
export async function yemekTani(img: HTMLImageElement, onP?: Ilerleme): Promise<Tahmin[]> {
  const pipe = await getPipe(onP);
  onP?.('Fotoğraf inceleniyor…');
  const parcalar = [kes(img, 0, 0, 1, 1), kes(img, 0, 0, .55, .55), kes(img, .45, 0, .55, .55), kes(img, 0, .45, .55, .55), kes(img, .45, .45, .55, .55)];
  const tum: Tahmin[][] = [];
  for (const p of parcalar) tum.push(await siniflandir(pipe, p));
  const en = new Map<string, number>();
  tum.forEach((liste, i) => liste.slice().sort((a, b) => b.skor - a.skor).slice(0, 2).forEach((t, k) => {
    const agirlik = (i === 0 ? 1.2 : 1) * (k === 0 ? 1 : 0.5);
    en.set(t.food.id, Math.max(en.get(t.food.id) ?? 0, t.skor * agirlik));
  }));
  return [...en.entries()].map(([id, skor]) => ({ food: FOODS.find(f => f.id === id)!, skor }))
    .filter(t => t.skor > 0.12).sort((a, b) => b.skor - a.skor).slice(0, 4);
}
