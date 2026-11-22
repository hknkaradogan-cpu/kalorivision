import { Entry, Profile, sum, today } from './types';
import { hedefler } from './calc';
import { oner } from './oneri';
// Cihaz üzerinde çalışan kural tabanlı asistan: veri dışarı gönderilmez. Tıbbi teşhis koymaz.
export function cevapla(soru: string, entries: Entry[], water: Record<string, number>, p?: Profile): string {
  const q = soru.toLocaleLowerCase('tr'); const bugun = entries.filter(e => e.date === today()); const t = sum(bugun);
  const h = p ? hedefler(p) : undefined; const kalan = h ? h.kcal - t.kcal : undefined;
  const not = '\n\nBu bir tahmindir; tıbbi tavsiye değildir. Sağlık sorunun varsa doktor veya diyetisyene danış.';
  if (q.includes('kaç kalori') || q.includes('kalori aldım')) return `Bugün şu ana kadar ${Math.round(t.kcal)} kcal kaydettin (protein ${Math.round(t.p)} g, karbonhidrat ${Math.round(t.c)} g, yağ ${Math.round(t.f)} g).${h ? ` Hedefin ${h.kcal} kcal, kalan ${Math.round(kalan!)} kcal.` : ' Hedef için Profil sekmesinden bilgilerini gir.'}`;
  if (q.includes('akşam') || q.includes('ne yemeli') || q.includes('öneri')) {
    if (!h) return 'Öneri için önce Profil sekmesinde bilgilerini girmelisin.';
    const o = oner(kalan!, h.p - t.p, p).slice(0, 3);
    return `Kalan ${Math.round(kalan!)} kcal ve ${Math.max(0, Math.round(h.p - t.p))} g proteinine göre: ` + o.map(x => `${x.ad} (${x.kcal} kcal, ${x.p} g protein)`).join('; ') + '. Detayları Beslenme sekmesindeki önerilerde görebilirsin.' + not;
  }
  if (q.includes('protein')) return h ? `Bugün ${Math.round(t.p)} g protein aldın, hedefin ${h.p} g. ${t.p >= h.p ? 'Hedefe ulaştın.' : `${Math.round(h.p - t.p)} g eksiğin var; yoğurt, yumurta, tavuk, baklagil ile tamamlayabilirsin.`}` : 'Protein hedefi için önce Profil bilgilerini gir.';
  if (q.includes('kilo ver')) return 'Sağlıklı kilo vermek için haftada 0,25-0,5 kg hedefle: günlük hedefini TDEE\'nin yaklaşık 450 kcal altında tut, her öğünde protein ve sebze ekle, şekerli içecekleri azalt, su iç, hareketi artır. Çok düşük kalori önerilmez.' + not;
  if (q.includes('sağlıklı mı') || q.includes('sağlıklı')) return 'Genel kural: sebze, baklagil, yoğurt ve az işlenmiş besinler iyi seçimlerdir; kızartma, şekerli ve çok tuzlu ürünleri sınırla. Belirli bir yemeği sorarsan besin değerlerine bakıp yorumlarım (Beslenme > Ara).' + not;
  if (q.includes('alternatif') || q.includes('az kalorili')) return 'Daha az kalorili seçenekler: kızartma yerine fırın/ızgara, beyaz ekmek yerine tam tahıl, kola yerine ayran veya su, tatlı yerine meyve, yağlı soslar yerine limon-yoğurt.' + not;
  if (q.includes('dengeli')) {
    if (!h || t.kcal === 0) return 'Henüz yeterli kayıt yok. Öğünlerini ekledikçe değerlendirebilirim.';
    const pc = ((t.p * 4) / t.kcal) * 100, cc = ((t.c * 4) / t.kcal) * 100, fc = ((t.f * 9) / t.kcal) * 100;
    return `Bugünkü dağılımın: protein %${Math.round(pc)}, karbonhidrat %${Math.round(cc)}, yağ %${Math.round(fc)}. Genel referans aralığı protein %10-30, karbonhidrat %45-60, yağ %20-35.` + not;
  }
  if (q.includes('su')) return `Bugün ${water[today()] ?? 0} ml su içtin.`;
  return 'Şunları sorabilirsin: "Bugün kaç kalori aldım?", "Akşam ne yemeliyim?", "Protein ihtiyacımı karşılıyor muyum?", "Kilo vermek için nasıl beslenmeliyim?", "Bugünkü beslenmem dengeli mi?", "Daha az kalorili alternatif ne olabilir?"';
}
