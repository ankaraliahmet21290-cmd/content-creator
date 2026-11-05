import { BriefForm, Scene } from '@/types';
import { GRADIENTS, SOP_ROLES } from './constants';
import { buildScenesFromSOP } from './providers';

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export function resolveApiKey(customKey?: string): string {
  const key = (customKey && customKey.trim()) || DEFAULT_GEMINI_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY tanımlı değil. Lütfen .env.local dosyasına ekleyin.');
  }
  return key;
}

// v5 Standardındaki yüksek çözünürlüklü profesyonel gayrimenkul / ticari varlık havuzu
const REAL_PHOTO_POOL: Record<string, string[]> = {
  residence: ['/real_assets/hero_residence.jpg', '/real_assets/01-hero.jpg', '/real_assets/04-ilan1.jpg'],
  villa: ['/real_assets/luxury_villa.jpg', '/real_assets/02-villa.jpg', '/real_assets/05-ilan2.jpg'],
  portfolio: ['/real_assets/03-portfoy.jpg', '/real_assets/06-ilan3.jpg', '/real_assets/07-ilan4.jpg', '/real_assets/08-ilan5.jpg', '/real_assets/09-ilan6.jpg'],
  team: ['/real_assets/client_seeoff_1.jpg', '/real_assets/client_seeoff_2.jpg'],
  map: ['/real_assets/modern_map.jpg', '/real_assets/real_office_street.jpg'],
  outro: ['/real_assets/outro_luxury.jpg', '/real_assets/real_office_front_hd.jpg']
};

export function matchBestRealPhoto(role: string, visualDesc: string, index: number): string {
  const v = (visualDesc || '').toLowerCase();
  if (v.includes('villa') || v.includes('müstakil')) return REAL_PHOTO_POOL.villa[index % REAL_PHOTO_POOL.villa.length];
  if (v.includes('ekip') || v.includes('ofis') || v.includes('danışman') || v.includes('müşteri') || role === 'Kanıt') {
    return REAL_PHOTO_POOL.team[index % REAL_PHOTO_POOL.team.length];
  }
  if (v.includes('harita') || v.includes('konum') || v.includes('merkez') || role === 'Özellik') {
    return REAL_PHOTO_POOL.map[index % REAL_PHOTO_POOL.map.length];
  }
  if (role === 'Çağrı' || v.includes('iletişim') || v.includes('çağrı')) {
    return REAL_PHOTO_POOL.outro[index % REAL_PHOTO_POOL.outro.length];
  }
  if (role === 'Çözüm' || role === 'Fayda') {
    return REAL_PHOTO_POOL.portfolio[index % REAL_PHOTO_POOL.portfolio.length];
  }
  return REAL_PHOTO_POOL.residence[index % REAL_PHOTO_POOL.residence.length];
}

/**
 * Raw 16-bit mono PCM (24000 Hz) verisini standart WAV Buffer -> Base64 Data URL formatına dönüştürür.
 */
function pcm16ToWavDataUrl(pcmBase64: string, sampleRate = 24000): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const wavBuffer = Buffer.alloc(44 + dataSize);

  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + dataSize, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20);
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(wavBuffer, 44);

  return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
}

interface RawGeminiScene {
  role?: string;
  sec?: number;
  text?: string;
  subtitle?: string;
  highlight?: string;
  vo?: string;
  visual?: string;
  grad?: [string, string];
  zoomDir?: 'in' | 'out';
}

/**
 * Gemini 2.5 Flash ile v5 standardında sinematik TV/sosyal medya reklam kurgusu üretir.
 */
export async function generateScenesWithGemini(
  brief: BriefForm,
  customApiKey?: string
): Promise<Scene[]> {
  const apiKey = resolveApiKey(customApiKey);
  const n = Math.max(3, Math.min(8, Math.round(brief.dur / 6.0)));
  const roles =
    n === 8
      ? SOP_ROLES
      : [SOP_ROLES[0], ...SOP_ROLES.slice(1, 7).slice(0, n - 2), SOP_ROLES[7]];

  const hookSec = brief.dur <= 20 ? 3.5 : 4.0;
  const remainingSec = +((brief.dur - hookSec) / (n - 1)).toFixed(1);

  const prompt = `Sen Türkiye'nin en iyi televizyon ve sosyal medya reklam yönetmenisin.
Aşağıdaki brief bilgilerine göre korkmaz-gayrimenkul-tanitim-v5 kalitesinde tam ${n} sahnelik SİNEMATİK bir ticari reklam filmi kurgula.

BRIEF VE KULLANICI TALİMATI:
- Ürün / Marka / Konu: "${brief.product}"
${brief.customInstructions ? `- ÖZEL REKLAM TALİMATI & İSTEKLER: "${brief.customInstructions}"` : ''}
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio}
- Dil Kodu: ${brief.lang || 'tr-TR'}

V5 REKLAM STANDARDI KURALLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. 1. sahne ("Kanca") süresi ${hookSec}s, diğer ${n - 1} sahne süresi ${remainingSec}s olmalı.
3. Her sahne için 3 kademeli güçlü tipografi oluştur:
   - "text": Ana Başlık (Büyük harf, vurucu, örn: "SEÇKİN PORTFÖY & DOĞRU YATIRIM", max 50 karakter)
   - "subtitle": Alt Başlık (Tamamlayıcı detay, örn: "Konut • İş Yeri • Arsa • Yatırım Danışmanlığı", max 65 karakter)
   - "highlight": Sarı/Altın Vurgu Metni (Ekranın en can alıcı vaadi veya çağrısı, max 60 karakter)
4. "vo": TV reklam seslendirmesi tonunda, çok akıcı, profesyonel ve etkileyici Türkçe konuşma metni.
5. "visual": Kamera çekim planı (örn: "Geniş açı villa ve havuz çekimi", "Ofiste sözleşme ve anahtar teslimi", "3D modern şehir ve yatırım haritası").
6. "zoomDir": Kamera hareket yönü ("in" veya "out").

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "Kanca",
    "sec": ${hookSec},
    "text": "HAYALİNİZDEKİ YAŞAMA ADIM ATIN",
    "subtitle": "Kırşehir'de Güven, Kalite ve Doğru Yatırım",
    "highlight": "Korkmaz Gayrimenkul Güvencesiyle",
    "vo": "Geleceğinizi güvenle inşa etmeye hazır mısınız? Şehrin en prestijli projeleri sizleri bekliyor.",
    "visual": "Lüks rezidans kuleleri ve gökyüzü günbatımı çekimi",
    "grad": ["#0b1329", "#1d2b4f"],
    "zoomDir": "in"
  }
]`;

  const url = `${GEMINI_BASE_URL}/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini LLM Hatası (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

  let parsed: RawGeminiScene[] = [];
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = [];
  }

  const fallbackScenes = buildScenesFromSOP(brief);

  return roles.map((expectedRole, i) => {
    const raw = parsed[i] || {};
    const fb = fallbackScenes[i] || fallbackScenes[0];
    const sec = i === 0 ? hookSec : remainingSec;

    const text = (raw.text || fb.text || brief.product).trim();
    const subtitle = (raw.subtitle || fb.visual || '').trim();
    const highlight = (raw.highlight || (i === roles.length - 1 ? (brief.cta || 'Hemen Bize Ulaşın') : '')).trim();
    const vo = (raw.vo || fb.vo || text).trim();
    const visual = (raw.visual || fb.visual).trim();
    const grad: [string, string] =
      Array.isArray(raw.grad) && raw.grad.length === 2
        ? [raw.grad[0], raw.grad[1]]
        : GRADIENTS[i % GRADIENTS.length];
    const zoomDir: 'in' | 'out' = raw.zoomDir === 'out' ? 'out' : 'in';

    // Gerçek sinematik görsel eşleştirmesi
    const imageUrl = matchBestRealPhoto(expectedRole, visual, i);

    return {
      id: i + 1,
      role: expectedRole,
      sec,
      text,
      subtitle,
      highlight,
      vo,
      visual,
      grad,
      imageUrl,
      zoomDir
    };
  });
}

const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts'
];

/**
 * Gemini TTS seslendirmesi üretir (Kadın: Kore, Erkek: Puck)
 */
async function generateSceneTTS(
  text: string,
  sceneIndex: number,
  apiKey: string,
  voiceGender: 'female' | 'male' = 'female'
): Promise<string | undefined> {
  if (!text || !text.trim()) return undefined;

  const model = TTS_MODELS[sceneIndex % TTS_MODELS.length];
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const voiceName = voiceGender === 'male' ? 'Puck' : 'Kore';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text.trim() }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName
              }
            }
          }
        }
      })
    });

    if (!res.ok) return undefined;
    const json = await res.json();
    const inlineData = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) return undefined;

    return pcm16ToWavDataUrl(inlineData.data, 24000);
  } catch {
    return undefined;
  }
}

/**
 * Sahnelerin seslendirmelerini ve sinematik varlıklarını bağlar
 */
export async function synthesizeClipsWithGemini(
  scenes: Scene[],
  brief: BriefForm,
  customApiKey?: string
): Promise<{ scenes: Scene[]; ttsCount: number; imgCount: number }> {
  const apiKey = resolveApiKey(customApiKey);
  let ttsCount = 0;

  const updatedScenes = await Promise.all(
    scenes.map(async (scene, idx) => {
      const audioUrl = await generateSceneTTS(scene.vo, idx, apiKey, brief.voiceGender || 'female');
      if (audioUrl) ttsCount++;

      const imageUrl = scene.imageUrl || matchBestRealPhoto(scene.role, scene.visual, idx);

      return {
        ...scene,
        imageUrl,
        audioUrl: audioUrl || scene.audioUrl
      };
    })
  );

  return { scenes: updatedScenes, ttsCount, imgCount: updatedScenes.length };
}
