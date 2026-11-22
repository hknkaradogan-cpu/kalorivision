// Open Food Facts (ücretsiz, açık veri). Çevrimdışıyken hata döner.
export interface UrunBilgi {
  barkod: string; ad: string; marka?: string; foto?: string; icindekiler?: string; alerjen?: string;
  kcal?: number; p?: number; c?: number; f?: number; seker?: number; tuz?: number; lif?: number;
}
export async function barkodAra(kod: string): Promise<UrunBilgi | null> {
  const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(kod)}.json?fields=product_name,product_name_tr,brands,image_front_small_url,ingredients_text_tr,ingredients_text,allergens_tags,nutriments`, { signal: AbortSignal.timeout(15000) });
  if (r.status === 404) return null; // OFF: ürün yok = 404
  if (!r.ok) throw new Error('Ürün servisine ulaşılamadı (' + r.status + ')');
  const j = await r.json().catch(() => null); if (!j || j.status !== 1 || !j.product) return null;
  const pr = j.product, n = pr.nutriments ?? {};
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined);
  let kcal = num(n['energy-kcal_100g']); if (kcal === undefined && num(n['energy_100g'])) kcal = Math.round(n['energy_100g'] / 4.184);
  const tuz = num(n['salt_100g']);
  return {
    barkod: kod, ad: pr.product_name_tr || pr.product_name || 'Adsız ürün', marka: pr.brands, foto: pr.image_front_small_url,
    icindekiler: pr.ingredients_text_tr || pr.ingredients_text, alerjen: (pr.allergens_tags ?? []).map((a: string) => a.replace(/^..:/, '')).join(', ') || undefined,
    kcal, p: num(n.proteins_100g), c: num(n.carbohydrates_100g), f: num(n.fat_100g), seker: num(n.sugars_100g), tuz, lif: num(n.fiber_100g),
  };
}
