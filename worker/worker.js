// Cloudflare Worker: KaloriVision asistanı. GEMINI_API_KEY Cloudflare'de GİZLİ DEĞER (Secret) olarak tutulur, kodda yoktur.
const SISTEM = `Sen KaloriVision uygulamasının Türkçe beslenme asistanısın. Samimi, kısa ve net yaz.
Kurallar: Tıbbi teşhis koyma, ilaç/insülin dozu söyleme, tedavi önerme. Hamilelik ve diyabette genel bilgi ver, plan için doktor/diyetisyene yönlendir.
Kullanıcı 18 yaş altıysa kalori hedefi verme. Aşırı düşük kalori (kadın <1200, erkek <1500 kcal) ve aç kalmayı önerme. Yeme bozukluğu belirtisi varsa nazikçe uzmana yönlendir.
Verilen "bağlam" (günlük kayıtlar, hedefler) üzerinden konuş; bilmediğin sayıyı uydurma. Konu dışı sorularda kibarca beslenmeye dön.`;
const IZIN = ['https://hknkaradogan-cpu.github.io', 'https://localhost', 'capacitor://localhost', 'http://localhost'];
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = { 'Access-Control-Allow-Origin': IZIN.includes(origin) ? origin : IZIN[0], 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('KaloriVision asistan', { headers: cors });
    let g; try { g = await req.json(); } catch { return new Response(JSON.stringify({ hata: 'Geçersiz istek' }), { status: 400, headers: cors }); }
    const mesajlar = Array.isArray(g.mesajlar) ? g.mesajlar.slice(-10) : [];
    if (!mesajlar.length || JSON.stringify(g).length > 12000) return new Response(JSON.stringify({ hata: 'Geçersiz içerik' }), { status: 400, headers: cors });
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SISTEM + '\n\nBağlam:\n' + String(g.baglam || '').slice(0, 3000) }] },
        contents: mesajlar.map(m => ({ role: m.k ? 'user' : 'model', parts: [{ text: String(m.m).slice(0, 1500) }] })),
        generationConfig: { temperature: 0.5, maxOutputTokens: 700 },
      }),
    });
    if (!r.ok) return new Response(JSON.stringify({ hata: r.status === 429 ? 'Günlük ücretsiz kota doldu, biraz sonra tekrar dene.' : 'Asistan şu an yanıt veremiyor.' }), { status: 502, headers: cors });
    const j = await r.json();
    const metin = j.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || 'Cevap üretemedim, soruyu başka türlü sorar mısın?';
    return new Response(JSON.stringify({ cevap: metin }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
