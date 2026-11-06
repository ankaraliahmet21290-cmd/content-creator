import { BriefForm, Preset, VideoType, CharacterProfile } from '@/types';

export const BG_MUSIC_OPTIONS = [
  {
    id: 'cinema_epic',
    label: '🎬 Epik Sinema & Orkestral Fragman',
    path: '/audio_assets/cinema_epic_trailer.wav',
    desc: 'Dramatik yaylılar, yükselen gerilim ve sub-bass vuruşları'
  },
  {
    id: 'youtube_lofi',
    label: '🎧 Modern Upbeat & Lo-Fi Beats',
    path: '/audio_assets/youtube_upbeat_lofi.wav',
    desc: 'YouTube, belgesel ve vloglar için sürükleyici akustik/ritmik ton'
  },
  {
    id: 'sales_corporate',
    label: '💼 Dinamik Satış & Kurumsal Fon',
    path: '/sales-music.wav',
    desc: 'Ürün tanıtımı, reklam ve enerjik marka duyurusu'
  },
  {
    id: 'none',
    label: '🔇 Müziksiz (Sadece Diyalog & Seslendirme)',
    path: '',
    desc: 'Arka plan müziği olmadan sadece saf seslendirme'
  }
];

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

export const PRESETS: Preset[] = [
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
    name: '🏢 Gayrimenkul / Lüks Emlak',
    data: {
      type: 'tanitim',
      product: 'Korkmaz Gayrimenkul - Elit Rezidans',
      audience: 'Yatırımcılar ve prestijli ev arayan aileler',
      points: 'Merkezi konum ve panoramik şehir manzarası\nAkıllı ev altyapısı ve 7/24 özel güvenlik\nYüksek kira getirisi ve uygun ödeme planı',
      cta: 'Özel randevu ve kat planları için hemen arayın.',
      tone: 'Prestijli & Lüks',
      dur: 30,
      ratio: '9:16',
      platform: 'Instagram Reels',
      lang: 'tr-TR',
      bgMusic: 'sales_corporate'
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
      product: 'Artisan Soğuk Demleme Kahve',
      audience: 'Gençler ve özel lezzet meraklıları',
      points: '18 saatte demlenen taze çekirdek lezzeti\nDoğal ve katkısız enerji kaynağı\nHer gün taze tatlılarla ikram fırsatı',
      cta: 'Hafta sonu arkadaşını al gel, ikinci kahve hediye!',
      tone: 'Samimi',
      dur: 15,
      ratio: '9:16',
      platform: 'TikTok',
      lang: 'tr-TR',
      bgMusic: 'sales_corporate'
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
      bgMusic: 'sales_corporate'
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
  customInstructions: 'Epik ve dramatik bir bilim kurgu film fragmanı kurgula. Karakter: Dedektif Kaan. Karanlık neon ışıklı sokaklar, fütüristik araçlar ve devasa hologramlar tasvir edilsin. Müzikal yükseliş ve gerilim doruk noktasına çıksın.',
  bgMusic: 'cinema_epic',
  character: CHARACTER_PRESETS[0]
};
