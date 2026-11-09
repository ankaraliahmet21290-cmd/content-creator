import { BriefForm, Preset, VideoType, CharacterProfile } from '@/types';

export const BG_MUSIC_OPTIONS = [
  {
    id: 'auto',
    label: '🎯 Akıllı Otomatik (Konuya Göre Eşle)',
    path: '',
    desc: 'Videonun konusuna ve atmosferine göre en uygun soundtrack yapay zekâ tarafından otomatik seçilir'
  },
  {
    id: 'cinema_epic',
    label: '🎬 Epik Sinema & Hollywood Fragmanı',
    path: '/audio_assets/cinema_epic_trailer.wav',
    desc: 'Dramatik yaylılar, yükselen aksiyon gerilimi ve derin sub-bass vuruşları'
  },
  {
    id: 'cinema_emotional',
    label: '🎻 Dramatik & Duygusal Piyano / Yaylılar',
    path: '/audio_assets/cinema_emotional_piano.wav',
    desc: 'Hüzünlü ve ilham verici grand piyano ezgileri, derin çello ve yaylılar'
  },
  {
    id: 'mystery_thriller',
    label: '🌘 Karanlık Gizem & Gerilim Pulse',
    path: '/audio_assets/mystery_thriller_pulse.wav',
    desc: 'Tetikleyici sub-bass nabzı, klostrofobik gerilim ve karanlık atmosfer'
  },
  {
    id: 'documentary_ambient',
    label: '🌍 Belgesel & Doğa Keşfi Ambient',
    path: '/audio_assets/documentary_ambient_earth.wav',
    desc: 'BBC Earth tarzı atmosferik padler, derin uzam ve organik tınılar'
  },
  {
    id: 'youtube_upbeat',
    label: '⚡ Modern Upbeat & Dinamik Vibe',
    path: '/audio_assets/youtube_upbeat_future.wav',
    desc: 'YouTube vlogları, tech incelemeleri ve modern ritmik enerji'
  },
  {
    id: 'youtube_lofi',
    label: '🎧 Lo-Fi Chill & Samimi Anlatım',
    path: '/audio_assets/youtube_lofi_chill.wav',
    desc: 'Sıcak Rhodes akorları, plak çıtırtısı ve rahatlatıcı hip-hop ritmi'
  },
  {
    id: 'tech_cyber',
    label: '🚀 Cyberpunk & Fütüristik Synthwave',
    path: '/audio_assets/tech_cyber_synthwave.wav',
    desc: 'Neon 80s analog arpejler, retro-fütüristik elektro bas ve aksiyon'
  },
  {
    id: 'corporate_prestige',
    label: '💼 Lüks & Prestij & Kurumsal Güven',
    path: '/audio_assets/corporate_prestige_luxury.wav',
    desc: 'Prestijli rezidans, holding, danışmanlık ve seçkin marka tanıtımı'
  },
  {
    id: 'sales_dynamic',
    label: '📢 Yüksek Enerji Ticari Satış & Reklam',
    path: '/audio_assets/sales_dynamic_drive.wav',
    desc: 'Dinamik akustik gitar ritmi, el çırpmaları ve yüksek dönüşümlü satış fonu'
  },
  {
    id: 'acoustic_warmth',
    label: '🌿 Sıcak Akustik & Organik Yaşam',
    path: '/audio_assets/acoustic_warmth_life.wav',
    desc: 'Parmakla çalınan samimi akustik gitar, organik doğa ve yaşam tarzı'
  },
  {
    id: 'sales_corporate',
    label: '🏢 Klasik Kurumsal & Satış Fonu',
    path: '/sales-music.wav',
    desc: 'Klasik enerjik tanıtım ve marka müziği'
  },
  {
    id: 'none',
    label: '🔇 Müziksiz (Sadece Diyalog & Seslendirme)',
    path: '',
    desc: 'Arka plan müziği olmadan sadece saf seslendirme'
  }
];

export function resolveBgmTrackPath(bgMusic?: string, type: string = 'sinema', topic: string = ''): string {
  if (bgMusic === 'none') return '';
  if (bgMusic && bgMusic !== 'auto' && bgMusic !== '') {
    const found = BG_MUSIC_OPTIONS.find(m => m.id === bgMusic);
    if (found && found.path) return found.path;
    if (bgMusic.startsWith('/')) return bgMusic;
  }

  // Akıllı otomatik eşleştirme (Konu ve türe göre)
  const t = (topic || '').toLowerCase();
  if (t.includes('gizem') || t.includes('korku') || t.includes('gerilim') || t.includes('cinayet') || t.includes('thriller')) {
    return '/audio_assets/mystery_thriller_pulse.wav';
  }
  if (t.includes('duygusal') || t.includes('dram') || t.includes('aşk') || t.includes('hüzün') || t.includes('piyano') || t.includes('sevgi')) {
    return '/audio_assets/cinema_emotional_piano.wav';
  }
  if (t.includes('cyber') || t.includes('siber') || t.includes('yapay zeka') || t.includes('robot') || t.includes('çip') || t.includes('kodlama')) {
    return '/audio_assets/tech_cyber_synthwave.wav';
  }
  if (t.includes('belgesel') || t.includes('tarih') || t.includes('arkeoloji') || t.includes('uzay') || t.includes('okyanus') || t.includes('evren') || t.includes('doğa') || type === 'belgesel') {
    return '/audio_assets/documentary_ambient_earth.wav';
  }
  if (t.includes('rezidans') || t.includes('villa') || t.includes('emlak') || t.includes('holding') || t.includes('lüks') || t.includes('prestij') || t.includes('mimari')) {
    return '/audio_assets/corporate_prestige_luxury.wav';
  }
  if (t.includes('kahve') || t.includes('organik') || t.includes('sağlık') || t.includes('yoga') || t.includes('tatil') || t.includes('çiftlik') || t.includes('lezzet') || t.includes('balon')) {
    return '/audio_assets/acoustic_warmth_life.wav';
  }
  if (t.includes('maç') || t.includes('futbol') || t.includes('gol') || t.includes('spor') || t.includes('derbi') || t.includes('şampiyon') || t.includes('stadyum') || t.includes('stuttgart') || t.includes('galatasaray') || t.includes('fenerbahçe') || t.includes('beşiktaş')) {
    return '/audio_assets/sales_dynamic_drive.wav';
  }
  if (t.includes('satış') || t.includes('indirim') || t.includes('kampanya') || t.includes('reklam') || type === 'reklam') {
    return '/audio_assets/sales_dynamic_drive.wav';
  }
  if (type === 'youtube') {
    return '/audio_assets/youtube_upbeat_future.wav';
  }
  if (type === 'sinema') {
    return '/audio_assets/cinema_epic_trailer.wav';
  }
  return '/audio_assets/corporate_prestige_luxury.wav';
}

export const CHARACTER_PRESETS: CharacterProfile[] = [
  {
    enabled: true,
    name: 'Dedektif Kaan',
    gender: 'male',
    ageGroup: '30-45 Yetişkin',
    roleArchetype: 'Dedektif & Siber Ajan',
    appearance: 'keskin yüz hatları, kısa siyah saçlar, hafif kirli sakal, kararlı ve odaklanmış bakışlar',
    clothing: 'koyu gri su geçirmez trençkot, yüksek yakalı siyah balıkçı kazak, taktiksel deri eldivenler',
    consistencyPrompt: '35 years old Turkish detective man named Kaan, sharp facial features, short neat black hair, light stubble beard, focused intense eyes, wearing dark grey waterproof trenchcoat and black turtleneck sweater, highly detailed cinematic facial features, photorealistic character consistency'
  },
  {
    enabled: true,
    name: 'Dr. Aylin Demir',
    gender: 'female',
    ageGroup: '30-45 Yetişkin',
    roleArchetype: 'Baş Bilim İnsanı',
    appearance: 'topuz yapılmış kumral saçlar, zeki ve derin bakışlı ela gözler, minimalist fütüristik ince gözlük',
    clothing: 'yüksek teknolojili beyaz laboratuvar ceketi, lacivert kumaş pantolon, yakasında dijital kimlik rozeti',
    consistencyPrompt: '33 years old Turkish female lead scientist named Aylin, stylish hazel eyes, hair tied in elegant bun, minimal futuristic thin glasses, wearing high-tech white lab coat, clean smart expression, photorealistic character consistency'
  },
  {
    enabled: true,
    name: 'Mert Aksoy',
    gender: 'male',
    ageGroup: '20-29 Genç',
    roleArchetype: 'Genç Girişimci & Teknoloji Lideri',
    appearance: 'modern dalgalı saçlar, enerjik ve karizmatik tebessüm, atletik yapı',
    clothing: 'antrasit bomber ceket, beyaz premium tişört, akıllı saat',
    consistencyPrompt: '28 years old modern Turkish young entrepreneur man named Mert, wavy dark hair, confident charismatic expression, wearing charcoal bomber jacket and clean white t-shirt, cinematic key lighting, consistent face'
  },
  {
    enabled: true,
    name: 'Selim Usta',
    gender: 'male',
    ageGroup: '45+ Olgun',
    roleArchetype: 'Bilge Rehber & Usta',
    appearance: 'kırlaşmış saç ve sakal, hayat tecrübesi dolu sıcak bakışlar, kırışık bilge yüz',
    clothing: 'toprak tonlarında yelek, keten gömlek, boynunda deri kordonlu saat',
    consistencyPrompt: '52 years old wise Turkish mentor man named Selim, greying hair and beard, warm empathetic eyes, thoughtful expression, wearing earth-toned vest and linen shirt, highly detailed skin texture, consistent cinematic face'
  },
  {
    enabled: true,
    name: 'Leyla Kaya',
    gender: 'female',
    ageGroup: '25-35 Genç/Yetişkin',
    roleArchetype: 'Gizemli Ajan & Kaşif',
    appearance: 'omuz hizasında dalgalı koyu kahve saçlar, delici yeşil gözler, kendinden emin duruş',
    clothing: 'siyah taktiksel deri mont, kargo pantolon, fütüristik kulaklık',
    consistencyPrompt: '30 years old Turkish female secret operative named Leyla, wavy shoulder-length dark brown hair, piercing green eyes, athletic confident posture, wearing black tactical leather jacket and cargo pants, cinematic rim light'
  }
];

export const TYPES: Record<VideoType, string> = {
  sinema: '🎬 Sinema Filmi & Fragman',
  belgesel: '🎙️ Sinematik Belgesel & Araştırma',
  youtube: '🔴 YouTube Video',
  reklam: '📢 Reklam Filmi',
  tanitim: '🏢 Ürün & Portföy Tanıtımı',
  sosyal: '📱 Sosyal Medya (Reels/Shorts)',
  egitim: '🎓 Eğitim & İpuçları',
  kurumsal: '💼 Kurumsal Hikaye'
};

export const TONES = [
  'Sinematik & Dramatik',
  'Epik & Bilim Kurgu / Aksiyon',
  'Belgesel & Merak Uyandırıcı',
  'YouTube Dinamik & Sürükleyici',
  'Gizemli & Gerilim',
  'Storytelling & Samimi',
  'Enerjik',
  'Profesyonel',
  'Prestijli & Lüks',
  'Eğlenceli',
  'Duygusal & İlham Verici'
];

export const RATIOS: Record<string, [number, number]> = {
  '21:9': [21, 9], // Sinematik Ultra Geniş (Cinemascope)
  '16:9': [16, 9], // YouTube Yatay / TV
  '9:16': [9, 16], // Dikey (Reels / Shorts / TikTok)
  '1:1': [1, 1]    // Kare (Post)
};

export const PLATFORMS = [
  'YouTube (Yatay 16:9)',
  'Sinema & Film Festivali (21:9 / 16:9)',
  'YouTube Shorts (9:16)',
  'Instagram Reels',
  'TikTok',
  'Web Sitesi & Portföy',
  'LinkedIn'
];

export const LANGUAGES = [
  { code: 'tr-TR', label: 'Türkçe' },
  { code: 'en-US', label: 'English' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'es-ES', label: 'Español' }
];

export const GRADIENTS: [string, string][] = [
  ['#1e1b4b', '#7c3aed'], // Gece moru
  ['#042f2e', '#0d9488'], // Zümrüt
  ['#450a0a', '#dc2626'], // Yakut kırmızısı
  ['#172554', '#2563eb'], // Kraliyet mavisi
  ['#1c1917', '#44403c'], // Taş / Lüks koyu
  ['#2e1065', '#d946ef'], // Neon fuşya
  ['#0c4a6e', '#0284c7'], // Okyanus
  ['#312e81', '#4338ca']  // Klasik indigo
];

export const SOP_ROLES = [
  'Kanca',
  'Sorun',
  'Çözüm',
  'Özellik',
  'Detay',
  'Kanıt',
  'Fayda',
  'Çağrı'
];

export const CINEMA_ROLES = [
  'Açılış & Atmosfer',
  'Karakter Tanıtımı',
  'Tetikleyici Olay',
  'Yükselen Gerilim',
  'Zirve Noktası (Climax)',
  'Final & Vizyon Çağrısı'
];

export const DOCUMENTARY_ROLES = [
  'Açılış: Büyük Gizem',
  'Tarihsel / Bilimsel Arka Plan',
  'Kritik Kanıt & Saha Bulguları',
  'Dönüm Noktası & Ezber Bozan Gerçek',
  'Uzman Analizi & Derinleşme',
  'Sonuç & Düşündürücü Kapanış'
];

export const YOUTUBE_ROLES = [
  'YouTube Kancası',
  'Giriş & Konu Özeti',
  'Bölüm 1: Arka Plan',
  'Bölüm 2: Derinlemesine Detay',
  'Çarpıcı Açıklama',
  'Özet & Abone Ol Çağrısı'
];

export const SHORTS_ROLES = [
  '⚡ Viral Kanca & Şok Başlangıç',
  '🔥 Yükselen Gerilim & Kritik An',
  '💥 Beklenmeyen Kırılma & Olay',
  '🚀 Zirve Patlaması & En Can Alıcı An',
  '👉 Takip Et & Yorumunu Yaz (CTA)'
];

export const SPORTS_ROLES = [
  '🏟️ Başlama Düdüğü & Tribün Coşkusu',
  '⚡ Tehlikeli Atak & İlk Tehdit',
  '⚽ GOOOL! Ağları Yırtan Vuruş',
  '🔥 Karşı Atak & Nefes Kesen Pozisyon',
  '🏆 Maçı Koparan Gol & Zafer Çığlığı',
  '👉 Maç Sonu Skoru & Maçın Adamı Kimdi? (CTA)'
];

export const PRESETS: Preset[] = [
  {
    name: '⚽ Futbol: GS - Stuttgart Maç Özeti & Goller',
    data: {
      type: 'sosyal',
      product: 'Galatasaray - Stuttgart Maç Özeti & Goller',
      audience: 'Futbol tutkunları, Galatasaray ve spor takipçileri',
      points: 'Nefes kesen 90 dakika ve kaçırılmayacak gol pozisyonları\nİnanılmaz şut ve köşeye giden 1. gol\nSon dakikalarda maçı koparan muhteşem vuruş',
      cta: 'Sizce maçın kırılma anı hangisiydi? Yorumlara yazın ve takip edin!',
      tone: 'Heyecanlı & Dinamik',
      dur: 25,
      ratio: '9:16',
      platform: 'YouTube Shorts (9:16)',
      lang: 'tr-TR',
      bgMusic: 'sales_dynamic',
      visualSource: 'web_search'
    }
  },
  {
    name: '🎬 Sinema: 2088 Son Şafak',
    data: {
      type: 'sinema',
      product: '2088: Son Şafak (The Last Dawn)',
      audience: 'Bilim kurgu, distopya ve sinemaseverler',
      points: 'Güneşin doğmadığı siberpunk mega kentte son insan direnişi\nYapay zekanın kontrolündeki gökdelenler ve karanlık yağmurlu sokaklar\nİnsanlığın kaderini belirleyecek son şifre',
      cta: 'Çok Yakında Sinemalarda ve IMAX Salonlarında.',
      tone: 'Sinematik & Dramatik',
      dur: 45,
      ratio: '21:9',
      platform: 'Sinema & Film Festivali (21:9 / 16:9)',
      lang: 'tr-TR',
      voiceGender: 'male',
      customInstructions: 'Epik ve dramatik bir bilim kurgu film fragmanı kurgula. Karakter: Dedektif Kaan. Karanlık neon ışıklı sokaklar, fütüristik araçlar ve devasa hologramlar tasvir edilsin. Müzikal yükseliş ve gerilim doruk noktasına çıksın.'
    }
  },
  {
    name: '🎙️ Belgesel: Piramitlerin Gizemi',
    data: {
      type: 'belgesel',
      product: 'Gize: Zamana Meydan Okuyan Sırlar',
      audience: 'Tarih, arkeoloji ve belgesel tutkunları',
      points: 'M.Ö. 2500 yılında inşa edilen dev blokların astronomik Orion hizalanması\nModern jeoradarların piramidin derinliklerinde tespit ettiği gizli odalar\nMühendislik sınırlarını aşan matematiksel ve mimari kusursuzluk',
      cta: 'Bölüm 1 bu akşam yayında. Tarihi yeniden keşfetmeye hazır olun.',
      tone: 'Belgesel & Merak Uyandırıcı',
      dur: 45,
      ratio: '16:9',
      platform: 'YouTube (Yatay 16:9)',
      lang: 'tr-TR',
      voiceGender: 'male',
      customInstructions: 'BBC Earth ve National Geographic standartlarında büyüleyici bir arkeoloji belgeseli kurgula. Merak uyandıran kadim bir soru ile başla. Sisli çöl ve gün doğumu drone çekimleri, antik hiyerogliflerin çözülüşü ve tarihin ezber bozan yönleri tok ve bilge bir sesle anlatılsın.'
    }
  },
  {
    name: '🌊 Belgesel: Okyanusun Derinlikleri',
    data: {
      type: 'belgesel',
      product: 'Mariana: Gezegenin En Karanlık Noktası',
      audience: 'Doğa, bilim ve deniz biyolojisi meraklıları',
      points: '11 bin metre derinlikte güneş ışığının hiç ulaşmadığı dünya\nİnanılmaz basınca ve dondurucu soğuğa meydan okuyan biyolüminesans canlılar\nDerin deniz araştırma denizaltısı ile yapılan son keşif seferi',
      cta: 'Belgesel serisinin tamamı web sitemizde.',
      tone: 'Belgesel & Merak Uyandırıcı',
      dur: 40,
      ratio: '16:9',
      platform: 'YouTube (Yatay 16:9)',
      lang: 'tr-TR',
      voiceGender: 'female',
      customInstructions: 'David Attenborough tarzında büyüleyici ve merak uyandıran bir derin deniz belgeseli. Karanlık sular, parlayan canlılar, denizaltı fenerleri ve okyanus tabanındaki mutlak sessizlik.'
    }
  },
  {
    name: '🔴 YouTube: Yapay Zekâ Devrimi',
    data: {
      type: 'youtube',
      product: 'Yapay Zekâ Sinema Sektörünü Nasıl Değiştiriyor?',
      audience: 'Teknoloji meraklıları ve YouTube izleyicileri',
      points: 'Hollywood senaryolarından kamera arkası VFX üretimine AI devrimi\nTek bir yaratıcının sıfır bütçeyle gişe rekoru kırabilecek film çekebilmesi\nGelecekte yönetmenlerin ve sinemanın rolü ne olacak?',
      cta: 'Videoyu beğendiyseniz abone olmayı ve yorumlarda düşüncelerinizi paylaşmayı unutmayın!',
      tone: 'Belgesel & Merak Uyandırıcı',
      dur: 60,
      ratio: '16:9',
      platform: 'YouTube (Yatay 16:9)',
      lang: 'tr-TR',
      voiceGender: 'female',
      customInstructions: 'İzleyiciyi ilk 5 saniyede ekrana kitleyen merak uyandırıcı bir YouTube video kancası ile başla. B-roll çekim önerileri, derinlemesine analiz ve sonunda YouTube abone ol & yorum yap çağrısı yap.'
    }
  },
  {
    name: '🍿 Kısa Film: Zamanın Ötesi',
    data: {
      type: 'sinema',
      product: 'Zamanın Ötesi - Kısa Film',
      audience: 'Gizem ve bağımsız sinema tutkunları',
      points: 'Antik bir saat kulesinde gizlenmiş paralel evren geçidi\nGeçmişi değiştirmeye çalışan yalnız bir saat ustası\nHer saniye başka bir gerçekliği siliyor',
      cta: 'Festival prömiyeri bu Cuma yayında.',
      tone: 'Gizemli & Gerilim',
      dur: 35,
      ratio: '21:9',
      platform: 'Sinema & Film Festivali (21:9 / 16:9)',
      lang: 'tr-TR',
      voiceGender: 'male',
      customInstructions: 'Gerilim ve gizem dolu bir kısa film fragmanı. Saat kulesi çarkları, loş ışıklar, tik tak sesleri ve zamanın kırılması.'
    }
  },
  {
    name: '💻 YouTube: Teknoloji İncelemesi',
    data: {
      type: 'youtube',
      product: '2026 Yeni Nesil AI Donanımları',
      audience: 'Teknoloji tutkunları ve yazılımcılar',
      points: 'Yapay zekayı doğrudan cihazda yerel çalıştıran çipler\nPerformans testleri ve günlük hayata yansımaları\nFiyat-performans karşılaştırması ve tavsiyeler',
      cta: 'Sizce bu teknolojiye değer mi? Yorumlarda buluşalım ve kanala abone olun!',
      tone: 'YouTube Dinamik & Sürükleyici',
      dur: 45,
      ratio: '16:9',
      platform: 'YouTube (Yatay 16:9)',
      lang: 'tr-TR',
      voiceGender: 'female',
      customInstructions: 'Dinamik bir YouTube tech inceleme videosu kurgula. Çarpıcı ürün karşılaştırması, hızlı geçişler ve abone olma çağrısı.'
    }
  },
  {
    name: '🏢 Korkmaz Gayrimenkul & İnşaat (Resmi Reklam)',
    data: {
      type: 'reklam',
      product: 'Korkmaz Gayrimenkul İnşaat',
      audience: 'Kırşehir ve çevre illerde konut, iş yeri, arsa arayan alıcılar ve yatırımcılar',
      points: 'Mustafa Korkmaz liderliğinde 15 yıllık brokerlik tecrübesi\nSalih Korkmaz denetiminde inşaat mühendisliği ve kentsel dönüşüm\nEİDS doğrulamalı güvenilir portföy ve mutlu müşteri memnuniyeti',
      cta: 'Medrese, 88. Sokak Kırşehir Merkez | korkmazgayrimenkulinsaat.com',
      tone: 'Prestijli & Lüks',
      dur: 45,
      ratio: '16:9',
      platform: 'TV & YouTube & Web (16:9)',
      lang: 'tr-TR',
      voiceGender: 'male',
      bgMusic: 'sales_corporate',
      enableLipSync: true,
      customInstructions: 'Kırşehir Korkmaz Gayrimenkul İnşaat için prestijli kurumsal tanıtım reklamı. Telefon numarası kesinlikle verilmeyecek. Mustafa Korkmaz ve Salih Korkmaz ekip olarak vurgulanacak. Gerçek ofis önü, müşteri uğurlama ve korkmazgayrimenkulinsaat.com web adresi işlenecek.'
    }
  },
  {
    name: '🚀 SaaS & Yazılım Reklamı',
    data: {
      type: 'reklam',
      product: 'BulutFlow AI Süreç Yönetimi',
      audience: 'Girişimciler ve proje yöneticileri',
      points: 'Tüm işleri tek tıkla otomatikleştirin\nEkip iletişiminde %40 zaman tasarrufu\nKredi kartsız 14 gün ücretsiz deneme',
      cta: 'Şimdi ücretsiz deneyin ve farkı görün.',
      tone: 'Enerjik',
      dur: 20,
      ratio: '16:9',
      platform: 'YouTube (Yatay 16:9)',
      lang: 'tr-TR',
      bgMusic: 'sales_corporate'
    }
  },
  {
    name: '☕ Kafe & Restoran Lansmanı',
    data: {
      type: 'sosyal',
      product: 'Artisan Soğuk Demleme Kahve & Roastery',
      audience: 'Nitelikli kahve ve gurme lezzet tutkunları',
      points: '18 saatte demlenen tek kökenli Etiyopya çekirdekleri\nÖdüllü baristalardan taze kavurma atölyesi\nTaş fırından yeni çıkmış sıcak kruvasanlar',
      cta: 'Hafta sonu arkadaşını al gel, ikinci özel kahve bizden!',
      tone: 'Samimi',
      dur: 20,
      ratio: '9:16',
      platform: 'TikTok',
      lang: 'tr-TR',
      bgMusic: 'acoustic_warmth'
    }
  },
  {
    name: '🎈 Turizm: Kapadokya Balon Turu',
    data: {
      type: 'reklam',
      product: 'Kapadokya: Gün Doğumu Balon Keşfi',
      audience: 'Seyahat severler, çiftler ve macera tutkunları',
      points: 'Peri bacalarının üzerinde altın saat gün doğumu uçuşu\nÖzel VIP sepet ve profesyonel fotoğraf çekimi\nUçuş sonrası şampanyalı kutlama ve sertifika töreni',
      cta: 'Erken rezervasyon fırsatıyla gökyüzündeki yerinizi hemen ayırtın.',
      tone: 'Duygusal & İlham Verici',
      dur: 35,
      ratio: '16:9',
      platform: 'Web Sitesi & Portföy',
      lang: 'tr-TR',
      bgMusic: 'cinema_emotional'
    }
  },
  {
    name: '⚡ Otomobil: Yeni Nesil Elektrikli GT',
    data: {
      type: 'reklam',
      product: 'Aura GT: Saf Elektrikli Süper Spor',
      audience: 'Otomobil tutkunları ve lüks teknoloji meraklıları',
      points: '0-100 km/s hızlanma 2.4 saniye ve 800 km menzil\nAerodinamik karbon gövde ve akıllı otonom pilot\nMinimalist lüks iç mekan ve panoramik cam tavan',
      cta: 'Özel test sürüşü randevusu için showroomumuza davetlisiniz.',
      tone: 'Prestijli & Lüks',
      dur: 30,
      ratio: '21:9',
      platform: 'YouTube (Yatay 16:9)',
      lang: 'tr-TR',
      bgMusic: 'tech_cyber'
    }
  },
  {
    name: '🎓 3 Adımda Eğitim Videosu',
    data: {
      type: 'egitim',
      product: 'Gayrimenkul Değerleme İpuçları',
      audience: 'İlk defa ev alacak alıcılar',
      points: '1. Bölgenin son 6 aylık satış geçmişini inceleyin\n2. İmar ve tapu takyidatını mutlaka sorgulayın\n3. Ulaşım ve metro yatırımlarını hesaba katın',
      cta: 'Daha fazlası için profilimizdeki rehberi indirin.',
      tone: 'Profesyonel',
      dur: 40,
      ratio: '9:16',
      platform: 'Instagram Reels',
      lang: 'tr-TR',
      bgMusic: 'corporate_prestige'
    }
  }
];

export const INITIAL_FORM: BriefForm = {
  type: 'sinema',
  product: '2088: Son Şafak (The Last Dawn)',
  audience: 'Bilim kurgu, distopya ve sinemaseverler',
  points: 'Güneşin doğmadığı siberpunk mega kentte son insan direnişi\nYapay zekanın kontrolündeki gökdelenler ve karanlık yağmurlu sokaklar\nİnsanlığın kaderini belirleyecek son şifre',
  cta: 'Çok Yakında Sinemalarda ve IMAX Salonlarında.',
  tone: 'Sinematik & Dramatik',
  dur: 45,
  ratio: '21:9',
  platform: 'Sinema & Film Festivali (21:9 / 16:9)',
  lang: 'tr-TR',
  voiceGender: 'male',
  customInstructions: 'Epik ve dramatik bir bilim kurgu film fragmanı kurgula. Karanlık neon ışıklı sokaklar, fütüristik araçlar ve devasa hologramlar tasvir edilsin. Müzikal yükseliş ve gerilim doruk noktasına çıksın.',
  bgMusic: 'auto',
  visualSource: 'ai_generate',
  character: {
    ...CHARACTER_PRESETS[0],
    enabled: false
  }
};
