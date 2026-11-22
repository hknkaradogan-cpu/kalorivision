// Genel bilgilendirme (Sağlık Bakanlığı / WHO / ACOG genel önerilerine dayalı özet). Kişiye özel tıbbi tavsiye değildir.
export interface Bolum { baslik: string; maddeler: string[] }
export const HAMILE_UYARI = 'Bu bilgiler genel rehberdir. Hamilelikte beslenme planını mutlaka doktorun veya diyetisyenin ile birlikte belirle.';
export const hamileAyRehberi = (ay: number): Bolum[] => {
  const donem = ay <= 3 ? 1 : ay <= 6 ? 2 : 3;
  const onerilen: Record<number, string[]> = {
    1: ['Folat: yeşil yapraklı sebzeler, baklagiller, portakal (folik asit takviyesi için doktoruna sor)', 'Bulantı için: az az ve sık öğün, kuru galeta/ekmek, zencefilli çay (az), ayran', 'Yumurta (iyice pişmiş), yoğurt, tam tahıllar'],
    2: ['Kalsiyum: süt, yoğurt, ayran, pastörize peynir (günde 3-4 porsiyon süt ürünü)', 'Demir: kırmızı et, mercimek, nohut, ıspanak + yanında C vitamini (limon, biber)', 'Protein: tavuk, hindi, iyi pişmiş balık, yumurta, baklagil'],
    3: ['Lif ve su: kabızlık için kuru meyve (kayısı, erik), tam tahıl, bol su', 'Küçük ve sık öğünler (mide yanması için), akşam geç yağlı yemekten kaçın', 'Omega-3: somon, sardalya (haftada 1-2 porsiyon, iyi pişmiş), ceviz'],
  };
  return [
    { baslik: `${ay}. ay – öne çıkanlar`, maddeler: onerilen[donem] },
    { baslik: 'Her ay güvenle tüketebileceklerin', maddeler: ['Sebze ve meyve (iyice yıkanmış)', 'Pastörize süt, yoğurt, ayran', 'İyice pişmiş tavuk, et, balık, yumurta', 'Mercimek, nohut, kuru fasulye', 'Tam tahıllı ekmek, bulgur, yulaf', 'Günde 2-3 L su (doktorun aksini söylemedikçe)'] },
    { baslik: 'Kaçınman gerekenler', maddeler: ['Çiğ veya az pişmiş et, tavuk, balık, yumurta, sushi', 'Pastörize olmayan süt ve peynirler', 'Alkol ve sigara', 'Kılıç balığı, köpekbalığı, uskumru (kral) gibi cıva oranı yüksek balıklar', 'Aşırı kafein (günde 200 mg, yaklaşık 2 fincan kahve üstü)', 'Aşırı karaciğer / A vitamini takviyesi', 'Yıkanmamış çiğ sebze, filiz'] },
    { baslik: 'Ne zaman doktora başvurmalısın?', maddeler: ['Sürekli kusma, kilo kaybı, şiddetli baş ağrısı, görme bulanıklığı, şişme, kanama veya bebeğin hareketlerinde azalma varsa hemen sağlık kuruluşuna git.'] },
  ];
};
export const DIYABET_UYARI = 'Bu bilgiler genel rehberdir; ilaç/insülin dozu ve kan şekeri hedefleri için doktorunun planına uy. Kan şekerin çok düşük veya çok yüksekse hemen sağlık kuruluşuna başvur.';
export const diyabetRehberi: Bolum[] = [
  { baslik: 'Tercih et', maddeler: ['Sebzeler (özellikle yeşil yapraklılar, brokoli, kabak)', 'Baklagiller: mercimek, nohut, kuru fasulye (lifli, yavaş yükseltir)', 'Tam tahıl: bulgur, yulaf, tam buğday ekmeği', 'Protein: tavuk, balık, yumurta, yoğurt, lor, kefir', 'Sağlıklı yağlar: zeytinyağı, ceviz, badem (avuç içi kadar)', 'Meyve: tek porsiyonlar halinde (1 küçük elma, 1 portakal, çilek), tek başına değil öğünle birlikte'] },
  { baslik: 'Sınırla / kaçın', maddeler: ['Şeker, bal, reçel, lokum, baklava, künefe, sütlaç gibi tatlılar', 'Şekerli içecekler: kola, meyve suyu, hazır çay-kahve şekerleri', 'Beyaz ekmek, simit, poğaça, beyaz pirinç, makarna büyük porsiyonlar', 'Patates kızartması ve işlenmiş atıştırmalıklar', 'Kuru meyveyi ve hurmayı fazla yeme'] },
  { baslik: 'Öğün düzeni', maddeler: ['Karbonhidratı gün içine eşit dağıt; her öğünde protein + sebze ekle', 'Bir öğünde karbonhidrat miktarını doktorunun/diyetisyeninin belirlediği aralıkta tut (uygulama 60 g üstünde uyarı verir)', 'Öğün atlama; ara öğünleri planla', 'Önce sebze/protein, sonra karbonhidrat yemek şeker artışını yavaşlatabilir', 'Yemekten sonra 10-15 dakika yürüyüş yardımcı olur'] },
];
export const KARB_UYARI_ESIK = 60; // g / öğün (genel referans)
