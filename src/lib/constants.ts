import { BriefForm, Preset, VideoType } from '@/types';

export const TYPES: Record<VideoType, string> = {
  reklam: 'Reklam Filmi',
  tanitim: 'Ürün & Portföy Tanıtımı',
  sosyal: 'Sosyal Medya (Reels/Shorts)',
  egitim: 'Eğitim & İpuçları',
  kurumsal: 'Kurumsal Hikaye'
};

export const TONES = [
  'Enerjik',
  'Samimi',
  'Profesyonel',
  'Prestijli & Lüks',
  'Eğlenceli',
  'Duygusal & İlham Verici'
];

export const RATIOS: Record<string, [number, number]> = {
  '9:16': [9, 16],
  '1:1': [1, 1],
  '16:9': [16, 9]
};

export const PLATFORMS = [
  'Instagram Reels',
  'TikTok',
  'YouTube Shorts',
  'YouTube Yatay',
  'LinkedIn',
  'Web Sitesi'
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

export const PRESETS: Preset[] = [
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
      platform: 'YouTube Yatay',
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
  lang: 'tr-TR'
};
