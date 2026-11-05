import { BriefForm, Preset, VideoType } from '@/types';

export const TYPES: Record<VideoType, string> = {
  sinema: '🎬 Sinema Filmi & Fragman',
  youtube: '🔴 YouTube Video & Belgesel',
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
  'Özellik',
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
      lang: 'tr-TR'
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
      lang: 'tr-TR'
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
      lang: 'tr-TR'
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
      lang: 'tr-TR'
    }
  }
];

export const INITIAL_FORM: BriefForm = {
  type: 'tanitim',
  product: 'Korkmaz Gayrimenkul - Elit Rezidans',
  audience: 'Yatırımcılar ve prestijli konut arayan aileler',
  points: 'Merkezi konum ve panoramik şehir manzarası\nAkıllı ev altyapısı ve 7/24 özel güvenlik\nYüksek kira getirisi ve uygun ödeme planı',
  cta: 'Özel randevu ve kat planları için hemen arayın.',
  tone: 'Prestijli & Lüks',
  dur: 30,
  ratio: '9:16',
  platform: 'Instagram Reels',
  lang: 'tr-TR',
  voiceGender: 'female',
  customInstructions: ''
};
