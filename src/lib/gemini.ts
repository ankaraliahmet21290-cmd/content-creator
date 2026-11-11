import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BriefForm, Scene } from '@/types';
import {
  GRADIENTS,
  SOP_ROLES,
  CINEMA_ROLES,
  DOCUMENTARY_ROLES,
  YOUTUBE_ROLES,
  SHORTS_ROLES,
  SPORTS_ROLES
} from './constants';
import { buildScenesFromSOP } from './providers';
import {
  matchBestCinemaPhoto,
  matchBestYouTubePhoto,
  matchBestRealPhoto,
  getScenePhoto
} from './assets';
import { fetchWebImageForScene } from './webSearch';

export {
  matchBestCinemaPhoto,
  matchBestYouTubePhoto,
  matchBestRealPhoto,
  getScenePhoto,
  fetchWebImageForScene
};

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
 * Raw 16-bit mono PCM (24000 Hz) verisini standart WAV Buffer formatına dönüştürür.
 */
export function pcm16ToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000): Buffer {
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

  return wavBuffer;
}

interface RawGeminiScene {
  role?: string;
  sec?: number;
  speaker?: string;
  voiceGender?: 'female' | 'male';
  text?: string;
  subtitle?: string;
  highlight?: string;
  vo?: string;
  visual?: string;
  grad?: [string, string];
  zoomDir?: 'in' | 'out';
  svgIllustration?: string;
}

/**
 * En-boy oranına ve türüne göre dinamik vektörel sahne kompozisyonu üretir.
 */
export function createThemedSceneVisual(
  grad: [string, string],
  role: string,
  visualDesc: string,
  index: number,
  ratio: string = '16:9',
  type: string = 'sinema',
  geminiIllustration?: string
): string {
  const [c1, c2] = grad;
  let w = 1280;
  let h = 720;
  if (ratio === '21:9') {
    w = 1400;
    h = 600;
  } else if (ratio === '9:16') {
    w = 720;
    h = 1280;
  } else if (ratio === '1:1') {
    w = 800;
    h = 800;
  }

  const isCinema = type === 'sinema' || ratio === '21:9';
  const isYouTube = type === 'youtube';

  const defaultShapes = isCinema
    ? `
      <g opacity="0.65">
        <circle cx="${w * 0.12}" cy="${h * 0.22}" r="1.5" fill="#ffffff" />
        <circle cx="${w * 0.28}" cy="${h * 0.15}" r="2" fill="#ffffff" />
        <circle cx="${w * 0.45}" cy="${h * 0.28}" r="1" fill="#ffffff" />
        <circle cx="${w * 0.68}" cy="${h * 0.18}" r="2" fill="#ffffff" />
        <circle cx="${w * 0.88}" cy="${h * 0.25}" r="1.5" fill="#38bdf8" />
        <circle cx="${w * 0.55}" cy="${h * 0.12}" r="2.5" fill="#fde047" opacity="0.8" />
      </g>
      <rect x="0" y="${h * 0.48}" width="${w}" height="3" fill="#38bdf8" opacity="0.75" filter="url(#glow)" />
      <ellipse cx="${w * 0.5}" cy="${h * 0.48}" rx="${w * 0.4}" ry="8" fill="#38bdf8" opacity="0.45" filter="url(#glow)" />
      <path d="M 0 ${h * 0.72} Q ${w * 0.28} ${h * 0.62} ${w * 0.52} ${h * 0.74} T ${w} ${h * 0.66} L ${w} ${h} L 0 ${h} Z" fill="#000000" opacity="0.6" />
      <path d="M 0 ${h * 0.82} Q ${w * 0.38} ${h * 0.75} ${w * 0.68} ${h * 0.85} T ${w} ${h * 0.78} L ${w} ${h} L 0 ${h} Z" fill="#000000" opacity="0.88" />
    `
    : isYouTube
      ? `
      <g opacity="0.18">
        <line x1="0" y1="${h * 0.2}" x2="${w}" y2="${h * 0.2}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
        <line x1="0" y1="${h * 0.5}" x2="${w}" y2="${h * 0.5}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
        <line x1="0" y1="${h * 0.8}" x2="${w}" y2="${h * 0.8}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
      </g>
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.32}" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.4" filter="url(#glow)" />
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.2}" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.3" />
    `
      : `
      <circle cx="${w * 0.25}" cy="${h * 0.3}" r="220" fill="${c2}" opacity="0.35" filter="url(#blur)" />
      <circle cx="${w * 0.75}" cy="${h * 0.65}" r="260" fill="#ffffff" opacity="0.12" filter="url(#blur)" />
      <path d="M 0 ${h * 0.75} Q ${w * 0.5} ${h * 0.6} ${w} ${h * 0.72} L ${w} ${h} L 0 ${h} Z" fill="#000000" opacity="0.35" />
    `;

  const illustration =
    geminiIllustration && geminiIllustration.trim().length > 15
      ? geminiIllustration
      : defaultShapes;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="35" />
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
        <stop offset="45%" stop-color="transparent" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.72)" />
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)" />
    <g class="scene-artwork">
      ${illustration}
    </g>
    <rect width="${w}" height="${h}" fill="url(#vignette)" />
    ${isCinema ? `<rect width="${w}" height="${h}" fill="rgba(0,0,0,0.22)" />` : ''}
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

/**
 * Gemini 2.5 Flash / 3.6 Flash ile Sinema Filmi, Belgesel, YouTube, Shorts/Reels veya Ticari Reklam kurgusu üretir.
 */
export async function generateScenesWithGemini(
  brief: BriefForm,
  customApiKey?: string
): Promise<Scene[]> {
  const apiKey = resolveApiKey(customApiKey);

  // Türe göre sahne rolleri ve sahne sayısı belirleme
  const isCinema = brief.type === 'sinema';
  const isDocumentary =
    brief.type === 'belgesel' ||
    brief.tone?.toLowerCase().includes('belgesel') ||
    /belgesel|documentary/i.test(brief.customInstructions || '') ||
    /belgesel|documentary/i.test(brief.product || '');
  const isYouTube = !isDocumentary && brief.type === 'youtube';
  const isSocial =
    !isCinema &&
    !isDocumentary &&
    !isYouTube &&
    (brief.type === 'sosyal' || brief.ratio === '9:16' || /shorts|reels|tiktok/i.test(brief.platform || ''));

  const isSports = !isCinema && !isDocumentary && brief.type !== 'reklam' && brief.type !== 'tanitim' &&
    /\b(futbol|stadyum|şampiyonlar\s+ligi|süper\s+lig|taraftar|derbi|maç\s+özeti|galatasaray|fenerbahçe|beşiktaş|trabzonspor)\b/i.test(
      `${brief.product} ${brief.customInstructions || ''}`
    );

  const baseRoles = isDocumentary
    ? DOCUMENTARY_ROLES
    : isCinema
      ? CINEMA_ROLES
      : isYouTube
        ? YOUTUBE_ROLES
        : isSports
          ? SPORTS_ROLES
          : isSocial
            ? SHORTS_ROLES
            : SOP_ROLES;

  const divisor = isCinema || isDocumentary ? 7.5 : isYouTube ? 8.0 : isSocial ? 4.5 : 6.0;
  const n = Math.max(4, Math.min(10, Math.round(brief.dur / divisor)));

  // Rol dizisini n uzunluğuna genişlet veya daralt
  const roles: string[] = [];
  if (n <= baseRoles.length) {
    roles.push(baseRoles[0]);
    const middleCount = n - 2;
    const step = Math.floor((baseRoles.length - 2) / middleCount) || 1;
    for (let i = 1; i <= middleCount; i++) {
      roles.push(baseRoles[Math.min(baseRoles.length - 2, 1 + (i - 1) * step)]);
    }
    roles.push(baseRoles[baseRoles.length - 1]);
  } else {
    for (let i = 0; i < n; i++) {
      roles.push(baseRoles[i % baseRoles.length]);
    }
  }

  const hookSec = brief.dur <= 20 ? 3.0 : isSocial ? 3.0 : isCinema || isDocumentary ? 4.5 : 4.0;
  const remainingSec = +((brief.dur - hookSec) / (n - 1)).toFixed(1);

  let prompt = '';

  if (isDocumentary) {
    prompt = `Sen BBC Earth, National Geographic ve uluslararası ödüllü bir Baş Belgesel Yönetmeni, Araştırmacı ve Senaristisin.
Kullanıcının talimatlarına, konusuna ve araştırma notlarına göre tam ${n} sahnelik BÜYÜLEYİCİ, FOTO-GERÇEKÇİ BİR SİNEMATİK BELGESEL kurgula.

BELGESEL BİLGİLERİ:
- Belgesel Adı / Konu: "${brief.product}"
${brief.customInstructions ? `- KULLANICININ YÖNETMEN VE ARAŞTIRMA TALİMATI: "${brief.customInstructions}"` : ''}
${brief.audience ? `- Hedef Kitle: "${brief.audience}"` : ''}
${brief.points ? `- Araştırılacak Kilit Bulgular / Maddeler: "${brief.points}"` : ''}
${brief.cta ? `- Kapanış Düşüncesi / Yayın Çağrısı: "${brief.cta}"` : ''}
- Anlatım Tonu: "${brief.tone || 'Belgesel & Merak Uyandırıcı'}"
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio}
- Dil: ${brief.lang || 'tr-TR'}

MUTLAK YÖNETMEN KURALI:
1. KONU NE İSE (Kapadokya, antik tarih, tıp, uzay, kahve sanatı vb.) TÜM METİNLER VE GÖRSELLER DOĞRUDAN O KONUYLA İLGİLİ OLMALIDIR.
2. "visual" alanı: National Geographic / BBC Earth tarzında detaylı İNGİLİZCE fotoğrafçılık yönergesi olmalıdır.

BELGESEL STANDARTLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. 1. sahne ("${roles[0]}") süresi ${hookSec}s, diğer ${n - 1} sahnenin her birinin süresi ${remainingSec}s olmalıdır.
3. Her sahne için:
   - "text": Sahne Başlığı (Büyük harf, vurucu, max 50 karakter)
   - "subtitle": Alt Başlık / Keşif Notu (max 65 karakter)
   - "highlight": Belgesel Adı / Bölüm Vurgusu (max 60 karakter)
   - "vo": BBC Earth tarzında derin, merak uyandıran, akıcı Türkçe belgesel anlatımı.
   - "visual": Detaylı İNGİLİZCE belgesel fotoğrafı promptu (örn: "Documentary photography of ..., shot on Hasselblad, natural lighting, 8k resolution, atmospheric depth").
   - "grad": Sahnenin atmosferine uygun 2 zengin HEX renk kodu.
   - "zoomDir": "in" veya "out".

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "BÜYÜK KEŞİF BAŞLIYOR",
    "subtitle": "Kadim Sırlar Açığa Çıkıyor",
    "highlight": "${brief.product.toUpperCase()}",
    "vo": "Yüzyıllardır saklı kalan sırlar, bugün bu araştırmayla gün yüzüne çıkıyor.",
    "visual": "National Geographic documentary photography of the topic, natural organic lighting, 8k resolution",
    "grad": ["#020617", "#0f172a"],
    "zoomDir": "in"
  }
]`;
  } else if (isCinema) {
    prompt = `Sen dünya çapında ödüllü bir Sinema Yönetmeni, Hollywood Senaryo Yazarı ve Görüntü Yönetmenisin (DoP).
Aşağıdaki brief ve yönetmen notlarına göre tam ${n} sahnelik EPİK BİR SİNEMA FİLMİ / FRAGMANI kurgula.

FİLM BİLGİLERİ:
- Film / Yapım Adı: "${brief.product}"
${brief.customInstructions ? `- YÖNETMEN NOTLARI, HİKÂYE & KARAKTERLER: "${brief.customInstructions}"` : ''}
${brief.audience ? `- Hedef Seyirci: "${brief.audience}"` : ''}
${brief.points ? `- Kilit Olay Örgüsü / Gerilim Unsurları: "${brief.points}"` : ''}
${brief.cta ? `- Vizyon / Çıkış Çağrısı: "${brief.cta}"` : ''}
- Atmosfer & Ton: "${brief.tone || 'Sinematik & Dramatik'}"
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio} (21:9 Cinemascope)
- Dil: ${brief.lang || 'tr-TR'}

MUTLAK YÖNETMEN KURALI:
1. KULLANICININ VERDİĞİ KONU MUTLAK ÖNCELİKTİR. Konu ne ise senaryo, replikler ve sahneler doğrudan ona ait olmalıdır.
2. "visual" alanı: Profesyonel İNGİLİZCE sinematik kamera promptu olmalıdır (örn: "Award-winning cinematic 35mm film still of ..., shot on Arri Alexa LF, anamorphic primes, cinematic lighting, DaVinci Resolve color grade, 8k photorealistic").

SİNEMA YAPIM KURALLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. 1. sahne ("${roles[0]}") süresi ${hookSec}s, diğer ${n - 1} sahne süresi ${remainingSec}s olmalı.
3. Her sahne için:
   - "speaker": Sahnedeki konuşmacı karakter adı ve unvanı
   - "voiceGender": Karakterin ses cinsiyeti ("female" veya "male")
   - "text": Sahne Başlığı / Sinematik Replik
   - "subtitle": Sahne Açıklaması
   - "highlight": Film Adı / Vizyon Müjdesi
   - "vo": Dramatik ve etkileyici Türkçe diyalog / monolog metni.
   - "visual": Detaylı İNGİLİZCE sinematik görsel promptu.
   - "grad": 2 kontrastlı sinematik HEX renk kodu.
   - "zoomDir": "in" veya "out".

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "speaker": "Dış Ses Anlatıcı",
    "voiceGender": "${brief.voiceGender || 'male'}",
    "text": "SİNEMATİK AÇILIŞ REPLİĞİ",
    "subtitle": "Sahne Açıklaması",
    "highlight": "${brief.product.toUpperCase()}",
    "vo": "Karanlığın ortasında, her şeyin başladığı o an...",
    "visual": "Cinematic 35mm film still describing the scene, Arri Alexa LF, cinematic lighting, photorealistic 8k",
    "grad": ["#020617", "#1e1b4b"],
    "zoomDir": "in"
  }
]`;
  } else if (isYouTube) {
    prompt = `Sen milyonlarca abonesi olan profesyonel bir YouTube İçerik Üreticisi ve YouTube Baş Editörüsün.
Aşağıdaki brief bilgilerine göre en yüksek izleyici tutma (Retention) sağlayacak tam ${n} sahnelik bir YOUTUBE VİDEO kurgusu oluştur.

YOUTUBE İÇERİK BİLGİLERİ:
- Video Başlığı / Konu: "${brief.product}"
${brief.customInstructions ? `- VİDEO TALİMATI & AYRINTILAR: "${brief.customInstructions}"` : ''}
${brief.audience ? `- Hedef Kitle: "${brief.audience}"` : ''}
${brief.points ? `- İşlenecek Ana Maddeler / Kanıtlar: "${brief.points}"` : ''}
${brief.cta ? `- YouTube Abone Ol & Kapanış Çağrısı: "${brief.cta}"` : ''}
- Anlatım Tonu: "${brief.tone || 'YouTube Dinamik & Sürükleyici'}"
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio}
- Dil: ${brief.lang || 'tr-TR'}

MUTLAK İÇERİK KURALI:
Videoda ne anlatılıyorsa sahneler ve görseller DOĞRUDAN o konuya ait olmalıdır.
"visual" alanı: İNGİLİZCE 4K YouTube B-roll promptu olmalıdır (örn: "High production value YouTube 4K frame showing ..., crisp studio focus, vibrant colors, 8k").

YOUTUBE STANDARTLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. 1. sahne ("${roles[0]}") süresi ${hookSec}s, diğer ${n - 1} sahne süresi ${remainingSec}s olmalı.
3. Her sahne için:
   - "text": YouTube Vurucu Ekran Başlığı (Büyük harf, max 45 karakter)
   - "subtitle": İnfografik / Açıklama Notu (max 65 karakter)
   - "highlight": Öne Çıkan Vurgu (max 40 karakter)
   - "vo": Samimi, enerjik, sürükleyici ve doğrudan izleyiciyle konuşan akıcı Türkçe YouTube anlatımı.
   - "visual": Detaylı İNGİLİZCE B-roll / fotoğraf promptu.
   - "grad": Canlı ve zengin 2 HEX renk kodu.
   - "zoomDir": "in" veya "out".

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "YOUTUBE DİKKAT ÇEKİCİ BAŞLIK",
    "subtitle": "İnfografik ve Açıklama Notu",
    "highlight": "ABONE OL & BEĞEN",
    "vo": "Samimi ve enerjik YouTube anlatım metni...",
    "visual": "Crisp 4K YouTube video still showing the exact topic, studio lighting, vibrant colors, 8k",
    "grad": ["#09090b", "#991b1b"],
    "zoomDir": "in"
  }
]`;
  } else if (isSocial && isSports) {
    prompt = `Sen Türkiye'nin en coşkulu, tutkulu ve viral Canlı Maç Spikeri, Futbol Yorumcusu ve YouTube Shorts / Instagram Reels Futbol Baş Editörüsün.
Kullanıcının talimatına göre ("${brief.product}") İZLEYİCİYİ İLK SANİYEDEN EKRANA KİLİTLEYEN, MAÇ SPİKERİ COŞKUSUNDA, HEYECAN DOLU tam ${n} sahnelik DİKEY 9:16 BİR MAÇ ÖZETİ & GOLLER SHORTS kurgusu oluştur!

MAÇ VE SPOR İÇERİK BİLGİLERİ:
- Maç / Konu: "${brief.product}"
${brief.customInstructions ? `- YÖNETMEN TALİMATI: "${brief.customInstructions}"` : ''}
${brief.points ? `- Kilit Pozisyonlar & Goller: "${brief.points}"` : ''}
${brief.cta ? `- Maç Sonu Yorum Çağrısı (CTA): "${brief.cta}"` : ''}
- Anlatım Tonu: "${brief.tone || 'Coşkulu & Heyecanlı Maç Anlatımı'}"
- Format: 9:16 Dikey Ekran (YouTube Shorts / Instagram Reels / TikTok)
- Toplam Süre: ${brief.dur} saniye
- Dil: ${brief.lang || 'tr-TR'}

MUTLAK MAÇ & SPOR KURALLARI:
1. BU BİR MAÇ ÖZETİ VE FUTBOL VİDEOSUDUR. Kesinlikle ticari ürün reklamı, satış, şirket tanıtımı ya da alakasız siberpunk yapma! Doğrudan bahsi geçen takımları (${brief.product}), futbolcuları, stadyum coşkusunu ve golleri anlat.
2. "vo" (Seslendirme): Canlı maç spikeri coşkusuyla, yüksek tempolu, nefes kesen Türkçe anlatım olmalı. (Örn: "Ve dev maçta ilk düdük çaldı! İnanılmaz bir tempo var sahada!", "Ceza sahasına orta, harika bir kafa vuruşu ve GOOOOOOL! Doksana giden enfes bir füze!", "Stuttgart baskı kuruyor, kaleci devleşti!", "Son dakikalarda gelen bu gol maçı koparıyor!")
3. "text" (Shorts Ana Başlığı): Dikey ekranda parlayan büyük vurucu maç başlıkları (örn: "DEV MAÇ BAŞLADI!", "GOOOL! 1-0!", "İNANILMAZ VURUŞ!", "MAÇI BİTİREN GOL!").
4. "subtitle": Dakika veya golcü detayı (örn: "Ceza Sahası Dışından Füze", "90+3'te Gelen Galibiyet").
5. "highlight": Skor veya Takım Vurgusu (örn: "GALATASARAY ÖNDE", "MAÇ SONU").
6. "visual": Yapay zekâ görsel motoru için İNGİLİZCE profesyonel maç ve stadyum aksiyon fotoğrafı yönergesi (örn: "Dynamic 9:16 vertical action sports photography of soccer match between Galatasaray and Stuttgart, player scoring goal, stadium floodlights, green pitch, intense sports action, 8k resolution, photorealistic").
7. "grad": Stadyum gece aydınlatması veya takım renklerine uygun 2 zengin HEX renk kodu (örn: ["#022c22", "#15803d"] veya ["#450a0a", "#b91c1c"]).
8. "zoomDir": "in" veya "out".

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "DEV MAÇ BAŞLADI!",
    "subtitle": "Nefes Kesen Mücadele",
    "highlight": "${brief.product.toUpperCase().slice(0, 30)}",
    "vo": "Ve dev maçta ilk düdük çaldı! İki takım da sahaya mutlak galibiyet parolasıyla çıkıyor!",
    "visual": "Dynamic 9:16 vertical action sports photography of soccer match with stadium floodlights, energetic crowd, 8k photorealistic",
    "grad": ["#022c22", "#15803d"],
    "zoomDir": "in"
  }
]`;
  } else if (isSocial) {
    prompt = `Sen milyonlarca izlenen YouTube Shorts, TikTok ve Instagram Reels içerikleri üreten Baş Viral Yönetmen ve Dikey Video Kurgucususun.
Kullanıcının talimatına göre ("${brief.product}") İLK 3 SANİYEDE İZLEYİCİYİ KİLİTLEYEN, YÜKSEK TEMPOLU 9:16 DİKEY tam ${n} sahnelik SHORTS kurgula!

VİRAL İÇERİK BİLGİLERİ:
- İçerik Konusu: "${brief.product}"
${brief.customInstructions ? `- ÖZEL TALİMATLAR: "${brief.customInstructions}"` : ''}
${brief.points ? `- Kilit Bilgiler / Maddeler: "${brief.points}"` : ''}
${brief.cta ? `- Takip Et & Yorum Yap Çağrısı (CTA): "${brief.cta}"` : ''}
- Format: 9:16 Dikey Ekran
- Toplam Süre: ${brief.dur} saniye
- Dil: ${brief.lang || 'tr-TR'}

VİRAL SHORTS KURALLARI:
1. Konu ne ise DOĞRUDAN o konuyu işle. Asla alakasız klişelere kayma.
2. "vo": Samimi, yüksek tempolu, merak uyandıran ve doğrudan izleyiciyle konuşan akıcı Türkçe konuşma.
3. "text": Dikey Shorts ekranında anında okunabilen büyük harfli kanca başlıkları (max 40 karakter).
4. "subtitle": Tamamlayıcı altyazı notu.
5. "highlight": Öne çıkan kelime veya anahtar terim.
6. "visual": Dikey 9:16 formatında yüksek kaliteli İNGİLİZCE fotoğraf/kamera promptu (örn: "Dynamic 9:16 vertical photography showing ..., vibrant colors, crisp focus, trending aesthetic, 8k").
7. "grad": 2 canlı HEX renk kodu.
8. "zoomDir": "in" veya "out".

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "BUNU BİLİYOR MUYDUNUZ?",
    "subtitle": "Kritik Detay",
    "highlight": "${brief.product.toUpperCase().slice(0, 30)}",
    "vo": "Eğer hala bunu görmediyseniz, çok büyük bir ayrıntıyı kaçırıyorsunuz!",
    "visual": "Dynamic 9:16 vertical photography showing the topic, mobile cinematography, vibrant colors, 8k",
    "grad": ["#0f172a", "#3b82f6"],
    "zoomDir": "in"
  }
]`;
  } else {
    prompt = `Sen Türkiye'nin en iyi televizyon ve sosyal medya reklam yönetmenisin.
Aşağıdaki brief bilgilerine göre tam ${n} sahnelik SİNEMATİK, PROFESYONEL VE YÜKSEK DÖNÜŞÜMLÜ bir ticari reklam filmi kurgula.

BRIEF VE KULLANICI BİLGİLERİ:
- Ürün / Marka / Konu: "${brief.product}"
${brief.audience ? `- Hedef Kitle: "${brief.audience}"` : ''}
${brief.points ? `- Öne Çıkan Satış Avantajları (USP) / Kilit Özellikler: "${brief.points}"` : ''}
${brief.cta ? `- Harekete Geçirici Mesaj (CTA): "${brief.cta}"` : ''}
- Anlatım Tonu: "${brief.tone || 'Enerjik'}"
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio}
- Dil Kodu: ${brief.lang || 'tr-TR'}

====================================================================
🚨 MUTLAK 1. ÖNCELİK - KULLANICININ YAZDIĞI SENARYO ÖZETİ VE İSTEKLER:
${brief.customInstructions ? `KULLANICININ VERDİĞİ SENARYO METNİ & ÖZEL İSTEKLERİ (TANIM):
"""
${brief.customInstructions}
"""

ZORUNLU YÖNETMEN VE KURGU KURALLARI:
1. Kullanıcının yukarıda yazdığı reklam senaryosu, sahne akışı, mekanlar, diyaloglar ve talepler EN YÜKSEK ÖNCELİKLİ EMİRDİR.
2. Sahne seslendirmeleri ("vo"): Kullanıcının yukarıda belirttiği senaryo akışını sahne sahne, eksiksiz, samimi ve profesyonel bir reklam seslendirmesiyle işle. Klişe veya kullanıcının istemediği alakasız şeylerden ASLA bahsetme!
3. Sahne görsel yönergeleri ("visual"): Kullanıcının istediği sahneyi tarif eden ultra detaylı İNGİLİZCE fotoğraf/kamera promptu yaz (örn: "Commercial advertising photography of [kullanıcının belirttiği sahne/eylem], luxury studio lighting, 8k resolution, photorealistic, premium commercial aesthetic, crisp focus").
4. Ekran metinleri ("text", "subtitle", "highlight"): Kullanıcının isteklerindeki en vurucu kelimeleri ve vaatleri doğrudan ekrana taşı.
` : `Kullanıcının belirlediği ürün, hedef kitle ve satış avantajlarına göre en çarpıcı, özgün reklam kurgusunu oluştur.`}
====================================================================

REKLAM STANDARTLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. 1. sahne ("${roles[0]}") süresi ${hookSec}s, diğer ${n - 1} sahne süresi ${remainingSec}s olmalı.
3. Her sahne için 3 kademeli güçlü tipografi oluştur:
   - "text": Ana Başlık (Büyük harf, vurucu, max 50 karakter)
   - "subtitle": Alt Başlık (Tamamlayıcı detay, max 65 karakter)
   - "highlight": Sarı/Altın Vurgu Metni (Ekranın en can alıcı vaadi veya çağrısı, max 60 karakter)
4. "vo": TV reklam seslendirmesi tonunda, çok akıcı, profesyonel ve etkileyici Türkçe konuşma metni.
5. "visual": Detaylı İNGİLİZCE reklam çekimi fotoğraf promptu.
6. "grad": Reklamın prestijine uygun 2 zengin HEX renk kodu.
7. "zoomDir": Kamera hareket yönü ("in" veya "out").

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "ÖNE ÇIKAN ÇARPICI BAŞLIK",
    "subtitle": "Alt Açıklama Detayı",
    "highlight": "En Önemli Vurgu",
    "vo": "Akıcı ve profesyonel seslendirme metni...",
    "visual": "Luxury commercial advertising photography of the product, studio lighting, 8k, photorealistic",
    "grad": ["#0b1329", "#1d2b4f"],
    "zoomDir": "in"
  }
]`;
  }

  // Güçlü ve hızlı modelleri sırayla dene: gemini-2.5-flash ilk sırada
  const candidateModels = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  let rawText = '[]';
  for (const model of candidateModels) {
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: isCinema ? 0.75 : isSports ? 0.8 : 0.65,
              topP: 0.95,
              responseMimeType: 'application/json'
            }
          })
        });
        clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 10) {
          rawText = candidateText.trim();
          break;
        }
      }
    } catch {
      // Bir sonraki yedek modeli dene
    }
  }

  // JSON ayrıştırma ve sahne nesnesi inşası
  try {
      let parsed: RawGeminiScene[] = [];
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(rawText);
      }

        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Gemini geçerli bir sahne dizisi üretemedi.');
        }

      return parsed.map((item, idx) => {
        const assignedRole = item.role || roles[idx] || (isSports ? `Pozisyon ${idx + 1}` : `Sahne ${idx + 1}`);
        const duration = item.sec && Number(item.sec) > 0 ? Number(item.sec) : (idx === 0 ? hookSec : remainingSec);
        const gradient = item.grad && item.grad.length === 2 ? item.grad : GRADIENTS[idx % GRADIENTS.length];
        const visualDesc = item.visual || `${brief.product} ${assignedRole}`;
        const zoomDir: 'in' | 'out' = item.zoomDir || (idx % 2 === 0 ? 'in' : 'out');

        const photoUrl = getScenePhoto(
          brief.type,
          assignedRole,
          visualDesc,
          idx,
          brief.product
        );

          return {
            id: idx + 1,
            role: assignedRole,
            sec: duration,
            speaker: item.speaker || (isCinema ? (idx % 2 === 0 ? 'Dış Ses Anlatıcı' : 'Karakter') : undefined),
            voiceGender: item.voiceGender || (isCinema ? (idx % 2 === 1 ? 'female' : 'male') : (brief.voiceGender || 'female')),
            text: item.text || `${brief.product.toUpperCase()}`,
            subtitle: item.subtitle || (isSports ? 'Kritik An' : 'Sinematik Kurgu'),
            highlight: item.highlight || (idx === parsed.length - 1 ? (brief.cta || 'FİNAL') : brief.product),
            vo: item.vo || item.text || brief.product,
            visual: visualDesc,
            grad: gradient,
            imageUrl: photoUrl,
            zoomDir
          };
        });
      } catch {
        return buildScenesFromSOP(brief);
      }
    }

  /**
   * Karakter tutarlılığı için tohum (seed) üretir.
   */
  function getCharacterSeed(consistencyPrompt: string): number {
    let hash = 0;
    for (let i = 0; i < consistencyPrompt.length; i++) {
      const char = consistencyPrompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash) % 900000;
  }

  const TTS_MODELS = [
    'gemini-2.5-flash-preview-tts',
    'gemini-3.8-flash-tts',
    'gemini-3.1-flash-tts-preview',
    'gemini-2.5-pro-preview-tts',
    'gemini-3.8-flash-lite-tts'
  ];

  /**
   * Yapay zekâ ile sıfırdan foto-gerçekçi sahne görseli üretir (Flux AI & SDXL Turbo AI).
   */
  export async function generateSceneImageAI(
    visualPrompt: string,
    ratio: string = '21:9',
    role: string = 'Sahne',
    briefType: string = 'sinema',
    index: number = 0,
    productTitle: string = '',
    characterPrompt?: string
  ): Promise<string> {
    let width = 1280;
      let height = 720;
      if (ratio === '21:9') {
        width = 1344;
        height = 576;
      } else if (ratio === '9:16') {
        width = 720;
        height = 1280;
      } else if (ratio === '1:1') {
        width = 800;
        height = 800;
      }

      const cleanPrompt = (visualPrompt || `${productTitle} ${role}`).trim();
      const charPrefix = characterPrompt ? `${characterPrompt.trim()}, ` : '';

      const isRealEstate = /gayrimenkul|emlak|inşaat|rezidans|villa|konut|daire|arsa|korkmaz|broker|tapu/i.test(
        `${cleanPrompt} ${productTitle}`
      );
      const isSports = !isRealEstate && briefType !== 'reklam' && briefType !== 'tanitim' &&
        /\b(futbol|stadyum|şampiyonlar\s+ligi|süper\s+lig|taraftar|derbi|maç\s+özeti|galatasaray|fenerbahçe|beşiktaş|trabzonspor)\b/i.test(
          `${cleanPrompt} ${productTitle}`
        );

      let enhancedPrompt = '';
        if (isSports) {
          enhancedPrompt = `${cleanPrompt}, dynamic action sports photography, professional soccer football match, player scoring goal, stadium floodlights, green pitch, high shutter speed, 8k resolution, photorealistic, athletic intensity, 9:16 vertical action frame`;
        } else if (briefType === 'reklam') {
          if (isRealEstate) {
            enhancedPrompt = `${cleanPrompt}, professional commercial architectural photography, luxury real estate and modern architecture, photorealistic, clean studio lighting, 8k resolution, elegant composition, crisp detail`;
          } else {
            enhancedPrompt = `${charPrefix}${cleanPrompt}, professional commercial advertising photography, luxury studio lighting, 8k resolution, photorealistic, premium commercial aesthetic, crisp sharp detail, award-winning cinematography`;
          }
        } else if (briefType === 'sosyal') {
          enhancedPrompt = `${charPrefix}${cleanPrompt}, trending high-retention 9:16 vertical frame for YouTube Shorts and TikTok, vibrant colors, crisp mobile cinematography, 8k resolution, dynamic focal depth`;
        } else if (briefType === 'sinema') {
          enhancedPrompt = `${charPrefix}${cleanPrompt}, award-winning cinematic 35mm film still, shot on Arri Alexa LF, Panavision anamorphic primes, 21:9 cinemascope, cinematic volumetric rim lighting, subtle film grain, color graded in DaVinci Resolve, photorealistic movie scene, 8k resolution, hyperdetailed`;
        } else if (briefType === 'belgesel') {
          enhancedPrompt = `${charPrefix}${cleanPrompt}, National Geographic and BBC Earth documentary film still, shot on Hasselblad, natural sunlight, organic textures, photorealistic documentary cinematography, 8k resolution, atmospheric depth`;
        } else if (briefType === 'youtube') {
          enhancedPrompt = `${charPrefix}${cleanPrompt}, high production value YouTube 4K video frame, studio lighting, crisp focus, vibrant colors, cinematic b-roll, 8k`;
        } else {
          enhancedPrompt = `${charPrefix}${cleanPrompt}, luxury commercial television advertisement photography, cinematic studio lighting, 8k, photorealistic, premium commercial aesthetic`;
        }

        const encoded = encodeURIComponent(enhancedPrompt);
        const baseSeed = characterPrompt ? getCharacterSeed(characterPrompt) : Math.floor(Math.random() * 900000);
        const seed = characterPrompt ? baseSeed + (index * 13) : Math.floor(Math.random() * 999999);

        // 1. Kademe: Flux AI Motoru (Ultra Yüksek Detay)
        const fluxUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 9000);
          const res = await fetch(fluxUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            if (buffer.length > 5000) {
              const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 10);
              const filename = `ai_scene_${Date.now()}_${index}_${hash}.jpg`;
              const dir = path.join(process.cwd(), 'public', 'generated_assets');
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              const savePath = path.join(dir, filename);
              fs.writeFileSync(savePath, buffer);
              return `/api/assets/${filename}`;
            }
          }
        } catch {
          // Flux meşgulse Hızlı Turbo modeline geç
        }

        // 2. Kademe: Hızlı Turbo AI Motoru (SDXL Hızlı Sentez)
        const turboUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=turbo`;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(turboUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            if (buffer.length > 5000) {
              const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 10);
              const filename = `ai_scene_${Date.now()}_${index}_${hash}.jpg`;
              const dir = path.join(process.cwd(), 'public', 'generated_assets');
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              const savePath = path.join(dir, filename);
              fs.writeFileSync(savePath, buffer);
              return `/api/assets/${filename}`;
            }
          }
        } catch {
          // Harici AI servisleri meşgulse internetten gerçek fotoğrafa geç
        }

        // 3. Kademe: İnternetten Canlı Gerçek Fotoğraf Arama (Wikimedia Commons 8K/HD)
        try {
          const webImg = await fetchWebImageForScene(cleanPrompt, productTitle, role, index, briefType);
          if (webImg && (webImg.startsWith('http://') || webImg.startsWith('https://'))) {
            return webImg;
          }
        } catch {
          // Tematik fotoğraf havuzuna geç
        }

        // 4. Kademe: Zengin Tematik Fotoğraf Havuzu Eşleştirmesi (Konuya %100 Uyumlu)
        return getScenePhoto(briefType, role, cleanPrompt, index, productTitle);
      }

      /**
       * Gemini TTS seslendirmesi üretir.
       */
      async function generateSceneTTS(
        text: string,
        sceneIndex: number,
        apiKey: string,
        voiceGender: 'female' | 'male' = 'female',
        _type: string = 'sinema'
      ): Promise<string | undefined> {
        void _type;
        if (!text || !text.trim()) return undefined;

        const cleanText = text.trim();
        const voiceName = voiceGender === 'male' ? 'Puck' : 'Kore';

        for (const model of TTS_MODELS) {
          const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: cleanText }] }],
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
            clearTimeout(timeoutId);

            if (res.ok) {
              const json = await res.json();
              const inlineData = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
              if (inlineData?.data) {
                const rawBuf = Buffer.from(inlineData.data, 'base64');
                let wavBuffer: Buffer;
                if (rawBuf.length > 44 && rawBuf.slice(0, 4).toString() === 'RIFF') {
                  wavBuffer = rawBuf;
                } else {
                  wavBuffer = pcm16ToWavBuffer(rawBuf, 24000);
                }

                try {
                  const dir = path.join(process.cwd(), 'public', 'generated_assets');
                  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                  const hash = crypto.createHash('md5').update(wavBuffer).digest('hex').slice(0, 8);
                  const filename = `tts_${Date.now()}_${sceneIndex}_${hash}.wav`;
                  const savePath = path.join(dir, filename);
                  fs.writeFileSync(savePath, wavBuffer);
                  return `/api/assets/${filename}`;
                } catch {
                  return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
                }
              }
            }
          } catch {
            // Bir sonraki TTS modelini dene
          }
        }

        return undefined;
      }

      /**
       * Sahnelerin hem gerçekçi AI film sahnelerini (Flux/Turbo AI veya Canlı Web Arama)
       * hem de stüdyo seslendirmelerini (Gemini TTS) sentezler.
       */
      export async function synthesizeClipsWithGemini(
        scenes: Scene[],
        brief: BriefForm,
        customApiKey?: string,
        ttsDisabled: boolean = false
      ): Promise<{ scenes: Scene[]; ttsCount: number; imgCount: number }> {
        let apiKey = '';
        if (!ttsDisabled) {
          try {
            apiKey = resolveApiKey(customApiKey);
          } catch {
            // API key bulunamadıysa TTS devre dışı kalır
          }
        }

        let ttsCount = 0;
        let imgCount = 0;

        const updatedScenes: Scene[] = [];
        const charPrompt = brief.character?.enabled ? brief.character.consistencyPrompt : undefined;
        const visualSource = brief.visualSource || 'ai_generate';

        // Sahneleri 2'şerli gruplar halinde işle (ağ darboğazını ve zaman aşımını önler)
        for (let i = 0; i < scenes.length; i += 2) {
          const batch = scenes.slice(i, i + 2);
          const batchResults = await Promise.all(
            batch.map(async (scene, bIdx) => {
              const idx = i + bIdx;

              // 1. Stüdyo Seslendirmesi (Sinemada karaktere göre Kadın / Erkek)
              const sceneVoiceGender: 'female' | 'male' =
                scene.voiceGender ||
                (brief.type === 'sinema' ? (idx % 2 === 1 ? 'female' : 'male') : (brief.voiceGender || 'female'));

              const audioPromise: Promise<string | undefined> =
                ttsDisabled || !apiKey
                  ? Promise.resolve(undefined)
                  : generateSceneTTS(scene.vo, idx, apiKey, sceneVoiceGender, brief.type);

              // 2. Sahne Görseli (visualSource seçimine göre: AI Üretimi, Web'den Canlı Arama veya Küratörlü Havuz)
              let imagePromise: Promise<string | undefined>;

              if (visualSource === 'web_search') {
                // İnternetten Canlı Gerçek Fotoğraf Bulma Modu
                const isAlreadyWebOrCustom =
                  scene.imageUrl &&
                  (scene.imageUrl.startsWith('http://') ||
                    scene.imageUrl.startsWith('https://') ||
                    scene.imageUrl.startsWith('/api/assets/'));

                imagePromise = isAlreadyWebOrCustom
                  ? Promise.resolve(scene.imageUrl)
                  : fetchWebImageForScene(
                    scene.visual || scene.text,
                    brief.product,
                    scene.role,
                    idx,
                    brief.type
                  );
              } else if (visualSource === 'curated') {
                // Tematik Seçkin Fotoğraf Kütüphanesi Modu
                imagePromise = Promise.resolve(
                  scene.imageUrl ||
                  getScenePhoto(brief.type, scene.role, scene.visual || scene.text, idx, brief.product)
                );
              } else {
                // Yapay Zekâ ile Sıfırdan Üretim Modu (Flux/Turbo AI)
                const isAlreadyAiGenerated =
                  scene.imageUrl &&
                  (scene.imageUrl.startsWith('/api/assets/ai_scene_') ||
                    scene.imageUrl.startsWith('/generated_assets/ai_scene_'));

                imagePromise = isAlreadyAiGenerated
                  ? Promise.resolve(scene.imageUrl)
                  : generateSceneImageAI(
                    scene.visual || scene.text,
                    brief.ratio || '21:9',
                    scene.role,
                    brief.type,
                    idx,
                    brief.product,
                    charPrompt
                  );
              }

              const [audioUrl, imageUrl] = await Promise.all([audioPromise, imagePromise]);

              if (audioUrl) ttsCount++;
              if (imageUrl) imgCount++;

              return {
                ...scene,
                imageUrl: imageUrl || scene.imageUrl,
                audioUrl: audioUrl || scene.audioUrl
              };
            })
          );
          updatedScenes.push(...batchResults);
        }

        return { scenes: updatedScenes, ttsCount, imgCount };
      }
