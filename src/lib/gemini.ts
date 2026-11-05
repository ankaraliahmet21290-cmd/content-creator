import { BriefForm, Scene } from '@/types';
import { GRADIENTS, SOP_ROLES, TYPES } from './constants';
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
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  wavBuffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
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

/**
 * Her sahne için yedek veya zenginleştirilmiş AI SVG arka plan kompozisyonu oluşturur.
 */
function createSceneSvgDataUrl(
  grad: [string, string],
  role: string,
  index: number,
  customSvgInner?: string
): string {
  const [c1, c2] = grad;
  const shapes =
    customSvgInner && customSvgInner.trim().length > 10
      ? customSvgInner
      : `
        <circle cx="${180 + (index * 90) % 440}" cy="${200 + (index * 70) % 360}" r="220" fill="${c2}" opacity="0.28" filter="url(#blur)" />
        <circle cx="${620 - (index * 80) % 400}" cy="${580 - (index * 60) % 320}" r="260" fill="#ffffff" opacity="0.08" filter="url(#blur)" />
        <path d="M 0 ${620 - (index % 3) * 40} Q 400 ${480 + (index % 2) * 80} 800 ${600 - (index % 4) * 30} L 800 800 L 0 800 Z" fill="#000000" opacity="0.22" />
      `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="45" />
      </filter>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="800" height="800" fill="url(#bg)" />
    <rect width="800" height="800" fill="url(#grid)" />
    ${shapes}
    <rect width="800" height="800" fill="rgba(0,0,0,0.18)" />
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

interface RawGeminiScene {
  role?: string;
  sec?: number;
  text?: string;
  vo?: string;
  visual?: string;
  grad?: [string, string];
  svgInner?: string;
}

/**
 * Gemini 2.5 Flash kullanarak SOP kurallarına tam uyumlu senaryo, sahne planı ve vektörel sahne kompozisyonu üretir.
 */
export async function generateScenesWithGemini(
  brief: BriefForm,
  customApiKey?: string
): Promise<Scene[]> {
  const apiKey = resolveApiKey(customApiKey);
  const n = Math.max(3, Math.min(8, Math.round(brief.dur / 5.5)));
  const roles =
    n === 8
      ? SOP_ROLES
      : [SOP_ROLES[0], ...SOP_ROLES.slice(1, 7).slice(0, n - 2), SOP_ROLES[7]];

  const hookSec = brief.dur <= 15 ? 2.5 : 3.0;
  const remainingSec = +((brief.dur - hookSec) / (n - 1)).toFixed(1);

  const prompt = `Sen profesyonel bir AI Video Yönetmeni ve Senaryo Yazarısın.
Aşağıdaki brief bilgilerine göre tam ${n} sahnelik bir video prodüksiyon planı oluştur.

BRIEF BİLGİLERİ:
- Ürün / Marka / Konu: "${brief.product}"
- Video Türü: "${TYPES[brief.type] || brief.type}"
- Hedef Kitle: "${brief.audience || 'Genel izleyici kitlesi'}"
- Ana Mesajlar / Öne Çıkanlar: "${brief.points || ''}"
- Harekete Geçirici Mesaj (CTA): "${brief.cta || 'Hemen inceleyin'}"
- Ton ve Atmosfer: "${brief.tone}"
- Toplam Süre: ${brief.dur} saniye
- Platform & Oran: ${brief.platform} (${brief.ratio})
- Dil Kodu: ${brief.lang}

ZORUNLU SOP VE KALİTE KONTROL (QC) KURALLARI:
1. Tam olarak ${n} adet sahne üretmelisin. Sırasıyla sahne rolleri şu şekilde olmalıdır: ${JSON.stringify(roles)}.
2. 1. sahnenin rolü kesinlikle "Kanca" olmalı ve süresi (sec) ${hookSec} saniye olmalıdır.
3. Diğer ${n - 1} sahnenin her birinin süresi (sec) ${remainingSec} saniye olmalıdır.
4. Son sahnenin rolü kesinlikle "Çağrı" olmalı ve CTA mesajını ("${brief.cta || 'Hemen arayın'}") içermelidir.
5. Her sahnenin "text" (ekran üstü başlık/altyazı) alanı çarpıcı, net ve EN FAZLA 55 karakter olmalıdır (kesinlikle 60 karakteri geçmemeli).
6. En az bir sahnenin "text" veya "vo" alanında ürün/marka adı ("${brief.product}") doğrudan geçmelidir.
7. "vo" alanı, seçilen dilde (${brief.lang}) seslendirilecek akıcı, doğal ve sahne süresine uygun uzunlukta seslendirme metnidir.
8. "visual" alanı, sahnenin sinematik kamera açısı, ışıklandırma ve görsel kompozisyon tarifidir.
9. "grad" alanı, sahnenin duygusuna uygun koyu/kontrastlı 2 adet HEX renk kodundan oluşan bir dizi olmalıdır (ör. ["#1e1b4b", "#7c3aed"]). Beyaz metinlerin okunabilmesi için çok açık renklerden kaçın.
10. "svgInner" alanı, 800x800 viewBox'lı bir SVG'nin içine yerleştirilecek, sahnenin konusunu simgeleyen estetik, modern, yarı saydam (opacity 0.12 - 0.35 arası) geometrik/ikonik SVG şekil etiketleri (<circle>, <path>, <rect>, <polygon> vb.) içermelidir. İçinde <svg> veya <text> etiketi KULLANMA, sadece şekil elementlerini yaz.

Yanıtı SADECE aşağıdaki JSON şemasında bir dizi (array) olarak döndür:
[
  {
    "role": "Kanca",
    "sec": ${hookSec},
    "text": "Kısa Çarpıcı Başlık",
    "vo": "Seslendirme metni...",
    "visual": "Sinematik kamera ve ışık tarifi...",
    "grad": ["#1e1b4b", "#7c3aed"],
    "svgInner": "<circle cx='400' cy='400' r='180' fill='rgba(255,255,255,0.12)' />"
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
    throw new Error(`Gemini LLM API Hatası (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawText: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

  let parsed: RawGeminiScene[] = [];
  try {
    parsed = JSON.parse(rawText);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Geçersiz sahne dizisi');
    }
  } catch {
    return buildScenesFromSOP(brief);
  }

  const fallbackScenes = buildScenesFromSOP(brief);

  const normalized: Scene[] = roles.map((expectedRole, i) => {
    const raw = parsed[i] || {};
    const fb = fallbackScenes[i] || fallbackScenes[0];
    const sec = i === 0 ? hookSec : remainingSec;

    let text = (raw.text || fb.text || brief.product).trim();
    if (text.length > 60) {
      text = text.slice(0, 57).trim() + '...';
    }

    const vo = (raw.vo || fb.vo || text).trim();
    const visual = (raw.visual || fb.visual).trim();

    const isValidHex = (c: unknown): c is string =>
      typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.trim());

    const grad: [string, string] =
      Array.isArray(raw.grad) && isValidHex(raw.grad[0]) && isValidHex(raw.grad[1])
        ? [raw.grad[0].trim(), raw.grad[1].trim()]
        : GRADIENTS[i % GRADIENTS.length];

    const imageUrl = createSceneSvgDataUrl(grad, expectedRole, i, raw.svgInner);

    return {
      id: i + 1,
      role: expectedRole,
      sec,
      text,
      vo,
      visual,
      grad,
      imageUrl
    };
  });

  // QC Kural 5 güvencesi: Ürün/marka adı hiçbir sahnede geçmiyorsa ilk sahneye ekle
  const prodSnippet = (brief.product || '').toLowerCase().slice(0, 5);
  const hasBrand =
    prodSnippet.length > 0 &&
    normalized.some(
      s =>
        s.text.toLowerCase().includes(prodSnippet) ||
        s.vo.toLowerCase().includes(prodSnippet)
    );

  if (!hasBrand && normalized.length > 0) {
    normalized[0].vo = `${brief.product}: ${normalized[0].vo}`;
  }

  return normalized;
}

const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts'
];

/**
 * Tek bir sahne metni için Gemini TTS modeliyle gerçekçi AI seslendirme (WAV Data URL) üretir.
 */
async function generateSceneTTS(
  text: string,
  sceneIndex: number,
  apiKey: string
): Promise<string | undefined> {
  if (!text || !text.trim()) return undefined;

  const model = TTS_MODELS[sceneIndex % TTS_MODELS.length];
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

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
                voiceName: 'Kore'
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
 * Opsiyonel olarak Gemini Image modeliyle sahne görseli üretmeyi dener (kota varsa).
 */
async function tryGenerateRasterImage(
  visualPrompt: string,
  product: string,
  apiKey: string
): Promise<string | undefined> {
  const url = `${GEMINI_BASE_URL}/gemini-2.5-flash-image:generateContent?key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Cinematic background visual for "${product}": ${visualPrompt}. No text, high contrast, modern commercial photography.`
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['IMAGE']
        }
      })
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    const part = json?.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { mimeType?: string; data?: string } }) => p.inlineData?.data
    );
    if (part?.inlineData?.data) {
      const mime = part.inlineData.mimeType || 'image/png';
      return `data:${mime};base64,${part.inlineData.data}`;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Tüm sahneler için Gemini TTS seslendirmelerini ve görsel varlıklarını sentezler.
 */
export async function synthesizeClipsWithGemini(
  scenes: Scene[],
  brief: BriefForm,
  customApiKey?: string
): Promise<{ scenes: Scene[]; ttsCount: number; imgCount: number }> {
  const apiKey = resolveApiKey(customApiKey);
  let ttsCount = 0;
  let imgCount = 0;

  // İlk sahne için raster image kotasını kontrol et; 429 dönerse diğer sahnelerde vakit kaybetmeden AI SVG kompozisyonunu kullan
  const firstRaster =
    scenes.length > 0
      ? await tryGenerateRasterImage(scenes[0].visual, brief.product, apiKey)
      : undefined;

  const updatedScenes = await Promise.all(
    scenes.map(async (scene, idx) => {
      const audioUrl = await generateSceneTTS(scene.vo, idx, apiKey);
      if (audioUrl) ttsCount++;

      let imageUrl = scene.imageUrl;
      if (idx === 0 && firstRaster) {
        imageUrl = firstRaster;
        imgCount++;
      } else if (idx > 0 && firstRaster) {
        const raster = await tryGenerateRasterImage(scene.visual, brief.product, apiKey);
        if (raster) {
          imageUrl = raster;
          imgCount++;
        }
      } else {
        if (!imageUrl) {
          imageUrl = createSceneSvgDataUrl(scene.grad, scene.role, idx);
        }
        imgCount++;
      }

      return {
        ...scene,
        imageUrl,
        audioUrl: audioUrl || scene.audioUrl
      };
    })
  );

  return { scenes: updatedScenes, ttsCount, imgCount };
}

