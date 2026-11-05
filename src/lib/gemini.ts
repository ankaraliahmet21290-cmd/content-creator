import { BriefForm, Scene } from '@/types';
import { GRADIENTS, SOP_ROLES, CINEMA_ROLES, DOCUMENTARY_ROLES, YOUTUBE_ROLES } from './constants';
import { buildScenesFromSOP } from './providers';
import {
  matchBestCinemaPhoto,
  matchBestYouTubePhoto,
  matchBestRealPhoto,
  getScenePhoto
} from './assets';

export { matchBestCinemaPhoto, matchBestYouTubePhoto, matchBestRealPhoto, getScenePhoto };

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
  svgIllustration?: string;
}

/**
 * En-boy oranına ve türüne (Sinema, YouTube, Reklam) göre dinamik vektörel sahne kompozisyonu üretir.
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
      <!-- Sinematik Yıldızlar & Parçacıklar -->
      <g opacity="0.65">
        <circle cx="${w * 0.12}" cy="${h * 0.22}" r="1.5" fill="#ffffff" />
        <circle cx="${w * 0.28}" cy="${h * 0.15}" r="2" fill="#ffffff" />
        <circle cx="${w * 0.45}" cy="${h * 0.28}" r="1" fill="#ffffff" />
        <circle cx="${w * 0.68}" cy="${h * 0.18}" r="2" fill="#ffffff" />
        <circle cx="${w * 0.88}" cy="${h * 0.25}" r="1.5" fill="#38bdf8" />
        <circle cx="${w * 0.55}" cy="${h * 0.12}" r="2.5" fill="#fde047" opacity="0.8" />
      </g>
      <!-- Anamorphic Sinematik Işık Flare -->
      <rect x="0" y="${h * 0.48}" width="${w}" height="3" fill="#38bdf8" opacity="0.75" filter="url(#glow)" />
      <ellipse cx="${w * 0.5}" cy="${h * 0.48}" rx="${w * 0.4}" ry="8" fill="#38bdf8" opacity="0.45" filter="url(#glow)" />
      <!-- Atmosferik Silüet Ufuk Çizgisi -->
      <path d="M 0 ${h * 0.72} Q ${w * 0.28} ${h * 0.62} ${w * 0.52} ${h * 0.74} T ${w} ${h * 0.66} L ${w} ${h} L 0 ${h} Z" fill="#000000" opacity="0.6" />
      <path d="M 0 ${h * 0.82} Q ${w * 0.38} ${h * 0.75} ${w * 0.68} ${h * 0.85} T ${w} ${h * 0.78} L ${w} ${h} L 0 ${h} Z" fill="#000000" opacity="0.88" />
    `
    : isYouTube
    ? `
      <!-- YouTube Dinamik Izgara & Grafik Çizgileri -->
      <g opacity="0.18">
        <line x1="0" y1="${h * 0.2}" x2="${w}" y2="${h * 0.2}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
        <line x1="0" y1="${h * 0.5}" x2="${w}" y2="${h * 0.5}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
        <line x1="0" y1="${h * 0.8}" x2="${w}" y2="${h * 0.8}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
        <line x1="${w * 0.2}" y1="0" x2="${w * 0.2}" y2="${h}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
        <line x1="${w * 0.5}" y1="0" x2="${w * 0.5}" y2="${h}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
        <line x1="${w * 0.8}" y1="0" x2="${w * 0.8}" y2="${h}" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 8" />
      </g>
      <!-- YouTube Dinamik Odak Halkaları -->
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.32}" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.4" filter="url(#glow)" />
      <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.2}" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.3" />
      <!-- YouTube Ses Dalgası / İnfografik Çubukları -->
      <g opacity="0.25">
        <rect x="${w * 0.42}" y="${h * 0.42}" width="6" height="35" rx="3" fill="#ffffff" />
        <rect x="${w * 0.45}" y="${h * 0.35}" width="6" height="55" rx="3" fill="#ef4444" />
        <rect x="${w * 0.48}" y="${h * 0.38}" width="6" height="48" rx="3" fill="#ffffff" />
        <rect x="${w * 0.51}" y="${h * 0.32}" width="6" height="65" rx="3" fill="#38bdf8" />
        <rect x="${w * 0.54}" y="${h * 0.39}" width="6" height="45" rx="3" fill="#ffffff" />
        <rect x="${w * 0.57}" y="${h * 0.43}" width="6" height="30" rx="3" fill="#ffffff" />
      </g>
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
    <!-- Arka Plan Gradyanı -->
    <rect width="${w}" height="${h}" fill="url(#bg)" />
    <!-- Stilize Sahne İllüstrasyonu -->
    <g class="scene-artwork">
      ${illustration}
    </g>
    <!-- Sinematik Vignette -->
    <rect width="${w}" height="${h}" fill="url(#vignette)" />
    ${isCinema ? `<rect width="${w}" height="${h}" fill="rgba(0,0,0,0.22)" />` : ''}
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}

/**
 * Gemini 2.5 Flash ile Sinema Filmi, YouTube Videosu veya Profesyonel Reklam kurgusu üretir.
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

  const baseRoles = isDocumentary
    ? DOCUMENTARY_ROLES
    : isCinema
    ? CINEMA_ROLES
    : isYouTube
    ? YOUTUBE_ROLES
    : SOP_ROLES;
  const divisor = isCinema || isDocumentary ? 7.5 : isYouTube ? 8.0 : 6.0;
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

  const hookSec = brief.dur <= 20 ? 3.5 : isCinema || isDocumentary ? 4.5 : 4.0;
  const remainingSec = +((brief.dur - hookSec) / (n - 1)).toFixed(1);

  let prompt = '';

  if (isDocumentary) {
    prompt = `Sen BBC Earth, National Geographic ve TRT Belgesel standartlarında ödüllü bir Baş Belgesel Yönetmeni, Bilim/Tarih Araştırmacısı ve Belgesel Senaristisin.
Kullanıcının talimatlarına ve araştırma notlarına göre 16:9 / 21:9 Geniş Ekran formatında tam ${n} sahnelik BÜYÜLEYİCİ BİR SİNEMATİK BELGESEL kurgula.

BELGESEL BİLGİLERİ:
- Belgesel Adı / Konu: "${brief.product}"
${brief.customInstructions ? `- KULLANICININ YÖNETMEN VE ARAŞTIRMA TALİMATI: "${brief.customInstructions}"` : ''}
${brief.audience ? `- Hedef Kitle: "${brief.audience}"` : ''}
${brief.points ? `- Araştırılacak Kilit Bulgular / Kanıtlar: "${brief.points}"` : ''}
${brief.cta ? `- Kapanış Düşüncesi / Yayın Çağrısı: "${brief.cta}"` : ''}
- Anlatım Tonu: "${brief.tone || 'Belgesel & Merak Uyandırıcı'}"
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio}
- Dil: ${brief.lang || 'tr-TR'}

MUTLAK YÖNETMEN TALİMATI KURALI:
Kullanıcının belirttiği özel talimatlar senaryonun en temel taşıdır. Talimatta geçen tüm tarihi olaylar, keşifler, mekanlar, hipotezler ve sorular sahne metinlerine, altyazılara ve seslendirmeye doğrudan, tutarlı ve derinlikli olarak yansıtılmalıdır.

BELGESEL KURGUSU VE TİPOGRAFİ STANDARTLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. 1. sahne ("${roles[0]}") süresi ${hookSec}s, diğer ${n - 1} sahne süresi ${remainingSec}s olmalıdır.
3. Her sahne için profesyonel belgesel tipografi tasarımı:
   - "text": Belgesel Bölüm Başlığı (Büyük harf, vurucu ve merak uyandıran, örn: "BÖLÜM 1: BÜYÜK GİZEM", "KAYIP ŞİFRE: 1513", max 50 karakter)
   - "subtitle": Konum / Tarih / Arşiv Bilgi Notu (Belgesel bilgi kartı formatında, örn: "Gize Platosu, M.Ö. 2500 • Son Jeoradar Taramaları", max 65 karakter)
   - "highlight": Belgesel Çarpıcı Bilgisi / Kanıt Vurgusu (örn: "TARİHTE İLK KEZ BELGELENDİ", "BİLİM DÜNYASINI SARSAN VERİ", max 60 karakter)
4. "vo": Usta bir belgesel seslendirme sanatçısı tonunda (merak uyandıran, dingin, bilge, derin ve akıcı) profesyonel Türkçe belgesel anlatımı (David Attenborough / Morgan Freeman / TRT Belgesel üslubu).
5. "visual": Belgesel kamera açısı, lens ve ışık yönergesi (örn: "Geniş açı 4K drone çekimi ile sisli çöl ve piramitler, altın saat ışığı", "Ultra makro lens ile antik hiyeroglif tableti ve loş fener aydınlatması").
6. "grad": Belgeselin atmosferine uygun 2 derin ve zengin HEX renk kodu (örn: ["#022c22", "#0f766e"] doğa/tarih veya ["#030712", "#1e3a8a"] uzay/derinlik).
7. "zoomDir": Kamera hareket yönü ("in" veya "out").

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "BÖLÜM 1: GİZEMİN BAŞLANGICI",
    "subtitle": "Gize Platosu • Son Jeoradar Keşifleri",
    "highlight": "TARİHİ YENİDEN YAZAN KEŞİF",
    "vo": "Yüzyıllardır göz önünde duran bu devasa anıtlar, aslında insanlığın henüz çözemediği bir kozmik haritayı mı gizliyordu?",
    "visual": "4K geniş açı drone çekimi, sisli çöl manzarası ve gün batımı ışığı",
    "grad": ["#022c22", "#0f766e"],
    "zoomDir": "in"
  }
]`;
  } else if (isCinema) {
    prompt = `Sen dünya çapında ödüllü bir Sinema Yönetmeni, Hollywood Senaryo Yazarı ve Görüntü Yönetmenisin (DoP).
Aşağıdaki brief ve yönetmen notlarına göre 21:9 / 16:9 Sinematik Geniş Ekran formatında tam ${n} sahnelik EPİK BİR SİNEMA FİLMİ / FRAGMANI kurgula.

FİLM BİLGİLERİ:
- Film / Yapım Adı: "${brief.product}"
${brief.customInstructions ? `- YÖNETMEN NOTLARI, HİKÂYE & KARAKTERLER: "${brief.customInstructions}"` : ''}
${brief.audience ? `- Hedef Seyirci: "${brief.audience}"` : ''}
${brief.points ? `- Kilit Olay Örgüsü / Gerilim Unsurları: "${brief.points}"` : ''}
${brief.cta ? `- Vizyon / Çıkış Çağrısı: "${brief.cta}"` : ''}
- Atmosfer & Ton: "${brief.tone || 'Sinematik & Dramatik'}"
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio} (Sinematik Format)
- Dil: ${brief.lang || 'tr-TR'}

MUTLAK YÖNETMEN VE SENARYO KURALI:
Kullanıcının talimatında belirttiği tüm karakterler, olay örgüsü, mekanlar, nesneler ve replikler senaryonun omurgasıdır. Asla jenerik kalıplar kullanma; doğrudan kullanıcının vizyonunu beyaz perdeye aktar.

SİNEMA YAPIM KURALLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. 1. sahne ("${roles[0]}") süresi ${hookSec}s, diğer ${n - 1} sahnenin her birinin süresi ${remainingSec}s olmalıdır.
3. Her sahne için sinematik tipografi ve replik tasarımı:
   - "text": Sahne Başlığı / Çarpıcı Sinematik Replik (Büyük harf, vurucu, max 50 karakter)
   - "subtitle": Sahne Açıklaması / Karakter Diyalog Notu (max 65 karakter)
   - "highlight": Film Adı / Vizyon Müjdesi (örn: "ÇOK YAKINDA SİNEMALARDA", max 60 karakter)
4. "vo": Sinema fragmanı seslendirme sanatçısı tonunda (tok, derin, dramatik ve büyüleyici) profesyonel Türkçe seslendirme metni.
5. "visual": Sinematik kamera açısı, lens ve ışık yönergesi (örn: "Anamorphic 35mm lens, yağmurlu neon sokaklar, alçak açı silüet ve sis", "Dolly zoom ve dramatik gün batımı ışığı").
6. "grad": Sahnenin dramatik atmosferine uygun 2 adet koyu/kontrastlı sinematik HEX renk kodu (örn: ["#020617", "#1e1b4b"] veya ["#180808", "#450a0a"]).
7. "zoomDir": Kamera hareket yönü ("in" veya "out").

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "SİNEMATİK ÇARPICI CÜMLE",
    "subtitle": "Karanlık bir gelecekte tek bir umut...",
    "highlight": "${brief.product.toUpperCase()}",
    "vo": "Tok ve dramatik anlatıcı sesiyle fragman repliği...",
    "visual": "Anamorfik 35mm lens, neon sokaklar ve sis",
    "grad": ["#020617", "#1e1b4b"],
    "zoomDir": "in"
  }
]`;
  } else if (isYouTube) {
    prompt = `Sen milyonlarca abonesi olan profesyonel bir YouTube İçerik Üreticisi ve YouTube Baş Editörüsün.
Aşağıdaki brief bilgilerine göre YouTube algoritmasında en yüksek izlenme ve izleyici tutma (Audience Retention) sağlayacak tam ${n} sahnelik bir YOUTUBE VİDEO kurgusu oluştur.

YOUTUBE İÇERİK BİLGİLERİ:
- Video Başlığı / Konu: "${brief.product}"
${brief.customInstructions ? `- VİDEO TALİMATI & AYRINTILAR: "${brief.customInstructions}"` : ''}
${brief.audience ? `- Hedef Kitle: "${brief.audience}"` : ''}
${brief.points ? `- İşlenecek Ana Maddeler / Kanıtlar: "${brief.points}"` : ''}
${brief.cta ? `- YouTube Abone Ol & Kapanış Çağrısı: "${brief.cta}"` : ''}
- Anlatım Tonu: "${brief.tone || 'YouTube Dinamik & Sürükleyici'}"
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio} (16:9 YouTube Yatay Standardı)
- Dil: ${brief.lang || 'tr-TR'}

YOUTUBE STANDARTLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. İlk 5 saniye kancası ("${roles[0]}") izleyiciyi hemen içine çeken en merak uyandırıcı soru veya vaatle başlamalıdır (${hookSec}s).
3. Her sahne için YouTube ekran üstü grafik metinleri:
   - "text": YouTube Ekran Başlığı (Dinamik, büyük harf, dikkat çekici, max 50 karakter)
   - "subtitle": İnfografik Alt Başlık / Veri Açıklaması (max 65 karakter)
   - "highlight": Sarı Vurgu / YouTube İpucu (max 60 karakter)
4. "vo": Samimi, enerjik, sürükleyici ve doğrudan izleyiciyle konuşan akıcı Türkçe YouTube anlatımı.
5. "visual": YouTube B-roll ve hareketli grafik yönlendirmesi (örn: "Hızlı tempolu ekran kayıtları, veri grafikleri ve animasyonlu geçişler", "Stüdyo kamera yakın çekim ve dinamik zoom").
6. "grad": YouTube estetiğine uygun canlı ve zengin 2 HEX renk kodu (örn: ["#09090b", "#7f1d1d"] veya ["#030712", "#1d4ed8"]).
7. "zoomDir": Kamera hareket yönü ("in" veya "out").
8. "svgIllustration": YouTube konseptine uygun infografik ve grafik vektör şekilleri (<g> içine <rect>, <circle>, veri eğrisi vb.). Dışına <svg> etiketi koyma!

Yanıtı SADECE aşağıdaki JSON dizisi formatında döndür:
[
  {
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "YOUTUBE DİKKAT ÇEKİCİ BAŞLIK",
    "subtitle": "İnfografik ve Açıklama Notu",
    "highlight": "ABONE OL & BEĞEN",
    "vo": "Samimi ve enerjik YouTube anlatım metni...",
    "visual": "Ekran grafikleri ve dinamik kamera çekimi",
    "grad": ["#09090b", "#991b1b"],
    "zoomDir": "in"
  }
]`;
  } else {
    prompt = `Sen Türkiye'nin en iyi televizyon ve sosyal medya reklam yönetmenisin.
Aşağıdaki brief bilgilerine göre tam ${n} sahnelik SİNEMATİK bir ticari reklam filmi kurgula.

BRIEF VE KULLANICI TALİMATI:
- Ürün / Marka / Konu: "${brief.product}"
${brief.customInstructions ? `- ÖZEL REKLAM TALİMATI & İSTEKLER: "${brief.customInstructions}"` : ''}
- Toplam Süre: ${brief.dur} saniye
- En-Boy Oranı: ${brief.ratio}
- Dil Kodu: ${brief.lang || 'tr-TR'}

V5 REKLAM STANDARDI KURALLARI:
1. Sahne Rolleri: ${JSON.stringify(roles)}.
2. 1. sahne ("${roles[0]}") süresi ${hookSec}s, diğer ${n - 1} sahne süresi ${remainingSec}s olmalı.
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
    "role": "${roles[0]}",
    "sec": ${hookSec},
    "text": "ÖNE ÇIKAN ÇARPICI BAŞLIK",
    "subtitle": "Alt Açıklama Detayı",
    "highlight": "En Önemli Vurgu",
    "vo": "Akıcı ve profesyonel seslendirme metni...",
    "visual": "Kamera açısı ve ışık kompozisyonu",
    "grad": ["#0b1329", "#1d2b4f"],
    "zoomDir": "in"
  }
]`;
  }

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
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
    }
    const json = JSON.parse(cleanText);
    if (Array.isArray(json)) {
      parsed = json;
    } else if (json && Array.isArray((json as { scenes?: RawGeminiScene[] }).scenes)) {
      parsed = (json as { scenes: RawGeminiScene[] }).scenes;
    } else if (json && Array.isArray((json as { data?: RawGeminiScene[] }).data)) {
      parsed = (json as { data: RawGeminiScene[] }).data;
    }
  } catch {
    parsed = [];
  }

  const fallbackScenes = buildScenesFromSOP(brief);

  // Gayrimenkul / ticari varlık havuzunu kullanıp kullanmayacağımızı tespit et (Sinema ve YouTube'da ASLA gayrimenkul fotoğrafı kullanma)
  const isRealEstateBrief =
    !isCinema &&
    !isYouTube &&
    (brief.type === 'tanitim' || /gayrimenkul|emlak|rezidans|villa|arsa|konut/i.test(brief.product || ''));

  return roles.map((expectedRole, i) => {
    const raw = parsed[i] || {};
    const fb = fallbackScenes[i] || fallbackScenes[0];
    const sec = i === 0 ? hookSec : remainingSec;

    const text = (raw.text || fb.text || brief.product).trim();
    const subtitle = (raw.subtitle || fb.visual || '').trim();
    const defaultHighlight =
      i === roles.length - 1
        ? (brief.cta || (isCinema ? 'Pek Yakında Sinemalarda' : isYouTube ? 'Abone Ol & Beğen' : 'Hemen Bize Ulaşın'))
        : '';
    const highlight = (raw.highlight || defaultHighlight).trim();
    const vo = (raw.vo || fb.vo || text).trim();
    const visual = (raw.visual || fb.visual).trim();
    const grad: [string, string] =
      Array.isArray(raw.grad) && raw.grad.length === 2
        ? [raw.grad[0], raw.grad[1]]
        : GRADIENTS[i % GRADIENTS.length];
    const zoomDir: 'in' | 'out' = raw.zoomDir === 'out' ? 'out' : 'in';

    // Gerçek yüksek çözünürlüklü sinematik / YouTube / emlak sahne görselini ata
    const imageUrl = getScenePhoto(brief.type, expectedRole, visual, i, brief.product);

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

      const imageUrl =
        scene.imageUrl ||
        getScenePhoto(brief.type, scene.role, scene.visual, idx, brief.product);

      return {
        ...scene,
        imageUrl,
        audioUrl: audioUrl || scene.audioUrl
      };
    })
  );

  return { scenes: updatedScenes, ttsCount, imgCount: updatedScenes.length };
}
