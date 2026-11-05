/**
 * Korkmaz Klaket Studio - Gerçek HD Görsel ve Sahne Varlık Havuzu (v5 Standardı)
 * Sinema (21:9 Cinemascope), YouTube (16:9 Geniş Ekran) ve Gayrimenkul / Ticari tanıtımlar için
 * yerel yüksek çözünürlüklü fotoğraf ve sinematik kare eşleştirici.
 */

// 1. Sinema Modu (21:9 Cinemascope / 16:9 Epik Film Kareleri)
export const CINEMA_PHOTO_POOL = {
  atmosphere: [
    '/cinema_assets/cyber_city_night.jpg',
    '/cinema_assets/cyber_neon_rain.jpg',
    '/cinema_assets/cyber_towers.jpg',
    '/cinema_assets/space_earth_orbit.jpg',
    '/cinema_assets/space_nebula.jpg'
  ],
  character: [
    '/cinema_assets/char_cyber_hero.jpg',
    '/cinema_assets/char_detective.jpg',
    '/cinema_assets/char_silhouette.jpg',
    '/cinema_assets/char_lone_street.jpg'
  ],
  incident: [
    '/cinema_assets/cyber_corridor.jpg',
    '/cinema_assets/space_galaxy.jpg',
    '/cinema_assets/action_dark_alley.jpg',
    '/cinema_assets/action_sparks.jpg'
  ],
  tension: [
    '/cinema_assets/action_chase.jpg',
    '/cinema_assets/action_dark_alley.jpg',
    '/cinema_assets/space_stars.jpg'
  ],
  climax: [
    '/cinema_assets/climax_rooftop.jpg',
    '/cinema_assets/climax_lightning.jpg',
    '/cinema_assets/action_explosion.jpg',
    '/cinema_assets/climax_fire_portal.jpg'
  ],
  outro: [
    '/cinema_assets/outro_dawn_sunrise.jpg',
    '/cinema_assets/outro_cinema_light.jpg',
    '/cinema_assets/outro_epic_horizon.jpg'
  ]
};

// 2. Belgesel Modu (16:9 / 21:9 Uluslararası Araştırma & Doğa / Tarih Kareleri)
export const DOCUMENTARY_PHOTO_POOL = {
  hook: [
    '/documentary_assets/doc_pyramids_giza.jpg',
    '/cinema_assets/space_earth_orbit.jpg',
    '/cinema_assets/outro_epic_horizon.jpg',
    '/cinema_assets/char_silhouette.jpg'
  ],
  archive: [
    '/cinema_assets/space_galaxy.jpg',
    '/cinema_assets/char_detective.jpg',
    '/cinema_assets/space_nebula.jpg'
  ],
  evidence: [
    '/documentary_assets/doc_pyramids_giza.jpg',
    '/cinema_assets/cyber_corridor.jpg',
    '/cinema_assets/space_stars.jpg'
  ],
  turning: [
    '/cinema_assets/climax_lightning.jpg',
    '/cinema_assets/climax_fire_portal.jpg',
    '/cinema_assets/action_sparks.jpg'
  ],
  analysis: [
    '/cinema_assets/cyber_towers.jpg',
    '/cinema_assets/cyber_city_night.jpg',
    '/youtube_assets/yt_data_charts.jpg'
  ],
  conclusion: [
    '/cinema_assets/outro_dawn_sunrise.jpg',
    '/cinema_assets/outro_epic_horizon.jpg',
    '/cinema_assets/outro_cinema_light.jpg'
  ]
};

// 3. YouTube Modu (16:9 Full HD İçerik & Stüdyo Görselleri)
export const YOUTUBE_PHOTO_POOL = {
  hook: [
    '/youtube_assets/yt_studio_neon.jpg',
    '/youtube_assets/yt_tech_desk.jpg'
  ],
  topic: [
    '/youtube_assets/yt_podcast_mic.jpg',
    '/youtube_assets/yt_creator_workspace.jpg'
  ],
  data: [
    '/youtube_assets/yt_data_charts.jpg',
    '/youtube_assets/yt_ai_chip.jpg'
  ],
  deep: [
    '/youtube_assets/yt_ai_chip.jpg',
    '/youtube_assets/yt_tech_desk.jpg'
  ],
  outro: [
    '/youtube_assets/yt_studio_neon.jpg',
    '/youtube_assets/yt_creator_workspace.jpg'
  ]
};

// 3. Gayrimenkul & Ticari Portföy Varlık Havuzu
export const REAL_PHOTO_POOL: Record<string, string[]> = {
  residence: ['/real_assets/hero_residence.jpg', '/real_assets/01-hero.jpg', '/real_assets/04-ilan1.jpg'],
  villa: ['/real_assets/luxury_villa.jpg', '/real_assets/02-villa.jpg', '/real_assets/05-ilan2.jpg'],
  portfolio: ['/real_assets/03-portfoy.jpg', '/real_assets/06-ilan3.jpg', '/real_assets/07-ilan4.jpg', '/real_assets/08-ilan5.jpg', '/real_assets/09-ilan6.jpg'],
  team: ['/real_assets/client_seeoff_1.jpg', '/real_assets/client_seeoff_2.jpg'],
  map: ['/real_assets/modern_map.jpg', '/real_assets/real_office_street.jpg'],
  outro: ['/real_assets/outro_luxury.jpg', '/real_assets/real_office_front_hd.jpg']
};

/**
 * Sahne rolüne ve görsel betimlemesine göre en uygun Sinematik Film Karesini eşleştirir.
 * Klasik 3 perdeli sinematik anlatı yapısına (Giriş, Gelişme, Doruk, Çözüm) tam uyumlu eşleme yapar.
 */
export function matchBestCinemaPhoto(role: string, visualDesc: string, index: number): string {
  const v = (visualDesc || '').toLowerCase();
  const r = (role || '').toLowerCase();

  // 1. Açılış & Dünya/Atmosfer Kurulumu
  if (r.includes('açılış') || r.includes('atmosfer')) {
    if (v.includes('yağmur') || v.includes('ıslak')) return '/cinema_assets/cyber_neon_rain.jpg';
    if (v.includes('uzay') || v.includes('yörünge')) return '/cinema_assets/space_earth_orbit.jpg';
    if (v.includes('kule') || v.includes('gökdelen')) return '/cinema_assets/cyber_towers.jpg';
    return CINEMA_PHOTO_POOL.atmosphere[index % CINEMA_PHOTO_POOL.atmosphere.length];
  }

  // 2. Karakter Tanıtımı
  if (r.includes('karakter') || r.includes('kahraman')) {
    if (v.includes('dedektif') || v.includes('polis')) return '/cinema_assets/char_detective.jpg';
    if (v.includes('silüet') || v.includes('gölge')) return '/cinema_assets/char_silhouette.jpg';
    if (v.includes('yalnız') || v.includes('sokak')) return '/cinema_assets/char_lone_street.jpg';
    return CINEMA_PHOTO_POOL.character[index % CINEMA_PHOTO_POOL.character.length];
  }

  // 3. Tetikleyici Olay / Keşif / Sır
  if (r.includes('tetikleyici') || r.includes('olay') || r.includes('keşif')) {
    if (v.includes('koridor') || v.includes('üssü') || v.includes('laboratuvar')) return '/cinema_assets/cyber_corridor.jpg';
    if (v.includes('galaksi') || v.includes('uzay')) return '/cinema_assets/space_galaxy.jpg';
    if (v.includes('karanlık') || v.includes('sokak')) return '/cinema_assets/action_dark_alley.jpg';
    return CINEMA_PHOTO_POOL.incident[index % CINEMA_PHOTO_POOL.incident.length];
  }

  // 4. Yükselen Gerilim / Takip / Tehdit
  if (r.includes('gerilim') || r.includes('kovalama') || r.includes('yüzleşme')) {
    if (v.includes('kovalamaca') || v.includes('hız') || v.includes('araç')) return '/cinema_assets/action_chase.jpg';
    if (v.includes('kıvılcım') || v.includes('metal')) return '/cinema_assets/action_sparks.jpg';
    return CINEMA_PHOTO_POOL.tension[index % CINEMA_PHOTO_POOL.tension.length];
  }

  // 5. Zirve Noktası / Climax / Büyük Patlama / Son Savaş
  if (r.includes('zirve') || r.includes('climax') || r.includes('doruk')) {
    if (v.includes('patlama') || v.includes('bomba') || v.includes('yangın')) return '/cinema_assets/action_explosion.jpg';
    if (v.includes('yıldırım') || v.includes('fırtına')) return '/cinema_assets/climax_lightning.jpg';
    if (v.includes('portal') || v.includes('alev')) return '/cinema_assets/climax_fire_portal.jpg';
    return CINEMA_PHOTO_POOL.climax[index % CINEMA_PHOTO_POOL.climax.length];
  }

  // 6. Final / Çözüm & Vizyon Çağrısı
  if (r.includes('final') || r.includes('vizyon') || r.includes('kapanış') || r.includes('çağrı')) {
    if (v.includes('şafak') || v.includes('güneş') || v.includes('doğuş')) return '/cinema_assets/outro_dawn_sunrise.jpg';
    if (v.includes('perde') || v.includes('ışık') || v.includes('vizyon')) return '/cinema_assets/outro_cinema_light.jpg';
    return CINEMA_PHOTO_POOL.outro[index % CINEMA_PHOTO_POOL.outro.length];
  }

  // Özel Açıklama / İçerik Anahtar Kelimeleriyle İkincil Eşleme
  if (v.includes('patlama') || v.includes('alev') || v.includes('bomba')) return '/cinema_assets/action_explosion.jpg';
  if (v.includes('yıldırım') || v.includes('şimşek')) return '/cinema_assets/climax_lightning.jpg';
  if (v.includes('kovalamaca') || v.includes('hızlı')) return '/cinema_assets/action_chase.jpg';
  if (v.includes('şafak') || v.includes('gündoğumu')) return '/cinema_assets/outro_dawn_sunrise.jpg';
  if (v.includes('uzay') || v.includes('dünya')) return '/cinema_assets/space_earth_orbit.jpg';
  if (v.includes('karakter') || v.includes('kahraman')) return CINEMA_PHOTO_POOL.character[index % CINEMA_PHOTO_POOL.character.length];

  // Genel Havuz Dağıtımı
  const allCinematic = [
    '/cinema_assets/cyber_city_night.jpg',
    '/cinema_assets/char_detective.jpg',
    '/cinema_assets/cyber_corridor.jpg',
    '/cinema_assets/action_chase.jpg',
    '/cinema_assets/climax_rooftop.jpg',
    '/cinema_assets/outro_epic_horizon.jpg'
  ];
  return allCinematic[index % allCinematic.length];
}

/**
 * YouTube rolleri ve içerik türüne göre en uygun stüdyo ve içerik görselini eşleştirir
 */
export function matchBestYouTubePhoto(role: string, visualDesc: string, index: number): string {
  const v = (visualDesc || '').toLowerCase();
  const r = (role || '').toLowerCase();

  // 1. YouTube Kancası
  if (r.includes('kanca') || index === 0) {
    return '/youtube_assets/yt_studio_neon.jpg';
  }

  // 2. Giriş & Konu
  if (r.includes('giriş') || r.includes('konu')) {
    return '/youtube_assets/yt_podcast_mic.jpg';
  }

  // 3. Bölüm 1 & Arka Plan
  if (r.includes('arka plan') || r.includes('bölüm 1')) {
    return '/youtube_assets/yt_creator_workspace.jpg';
  }

  // 4. Bölüm 2 & Veri Analizi
  if (r.includes('detay') || r.includes('bölüm 2')) {
    return '/youtube_assets/yt_data_charts.jpg';
  }

  // 5. Çarpıcı Açıklama & Teknoloji / AI
  if (r.includes('çarpıcı')) {
    return '/youtube_assets/yt_ai_chip.jpg';
  }

  // 6. Özet & Abone Ol Çağrısı
  if (r.includes('özet') || r.includes('abone') || r.includes('çağrı')) {
    return '/youtube_assets/yt_studio_neon.jpg';
  }

  if (v.includes('veri') || v.includes('grafik') || v.includes('analiz')) {
    return '/youtube_assets/yt_data_charts.jpg';
  }
  if (v.includes('yapay zeka') || v.includes('çip') || v.includes('donanım')) {
    return '/youtube_assets/yt_ai_chip.jpg';
  }
  if (v.includes('podcast') || v.includes('mikrofon')) {
    return '/youtube_assets/yt_podcast_mic.jpg';
  }

  return YOUTUBE_PHOTO_POOL.hook[index % YOUTUBE_PHOTO_POOL.hook.length];
}

/**
 * Gayrimenkul ve ticari portföy için en uygun fotoğrafı eşleştirir
 */
export function matchBestRealPhoto(role: string, visualDesc: string, index: number): string {
  const v = (visualDesc || '').toLowerCase();
  if (v.includes('villa') || v.includes('müstakil')) {
    return REAL_PHOTO_POOL.villa[index % REAL_PHOTO_POOL.villa.length];
  }
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
 * Belgesel (Documentary) sahneleri için en uygun görseli eşleştirir
 */
export function matchBestDocumentaryPhoto(role: string, visualDesc: string, index: number, product?: string): string {
  const v = (visualDesc || '').toLowerCase();
  const r = (role || '').toLowerCase();
  const p = (product || '').toLowerCase();
  const combined = `${v} ${r} ${p}`;

  // 1. Antik Tarih & Piramitler & Arkeoloji
  if (combined.includes('piramit') || combined.includes('mısır') || combined.includes('gize') || combined.includes('arkeoloji') || combined.includes('tapınak') || combined.includes('hiyeroglif')) {
    return '/documentary_assets/doc_pyramids_giza.jpg';
  }

  // 2. Uzay, Evren, Gezegen & Kozmoloji
  if (combined.includes('uzay') || combined.includes('galaksi') || combined.includes('yıldız') || combined.includes('evren') || combined.includes('kozmos')) {
    if (combined.includes('dünya') || combined.includes('yörünge')) return '/cinema_assets/space_earth_orbit.jpg';
    if (combined.includes('bulutsu') || combined.includes('nebula')) return '/cinema_assets/space_nebula.jpg';
    return '/cinema_assets/space_galaxy.jpg';
  }

  // 3. Teknoloji, Veri & Bilim
  if (combined.includes('bilim') || combined.includes('çip') || combined.includes('laboratuvar') || combined.includes('teknoloji') || combined.includes('yapay zeka')) {
    return index % 2 === 0 ? '/youtube_assets/yt_ai_chip.jpg' : '/youtube_assets/yt_data_charts.jpg';
  }

  // 4. Doğa Olayları & Gerilim & Keşif
  if (combined.includes('fırtına') || combined.includes('şimşek') || combined.includes('yıldırım') || combined.includes('şok')) {
    return '/cinema_assets/climax_lightning.jpg';
  }

  // 5. Araştırmacı, Dedektif, Tarihsel Figür
  if (combined.includes('araştırmacı') || combined.includes('bilim insanı') || combined.includes('kaşif') || combined.includes('silüet')) {
    return index % 2 === 0 ? '/cinema_assets/char_detective.jpg' : '/cinema_assets/char_silhouette.jpg';
  }

  // 6. Kapanış, Gün Doğumu, Ufuk
  if (r.includes('sonuç') || r.includes('kapanış') || combined.includes('ufuk') || combined.includes('şafak') || combined.includes('güneş')) {
    return '/cinema_assets/outro_dawn_sunrise.jpg';
  }

  // Sahne rolüne göre dağılım
  if (r.includes('açılış') || r.includes('gizem') || index === 0) {
    return DOCUMENTARY_PHOTO_POOL.hook[index % DOCUMENTARY_PHOTO_POOL.hook.length];
  }
  if (r.includes('tarih') || r.includes('arka plan')) {
    return DOCUMENTARY_PHOTO_POOL.archive[index % DOCUMENTARY_PHOTO_POOL.archive.length];
  }
  if (r.includes('kanıt') || r.includes('bulgu')) {
    return DOCUMENTARY_PHOTO_POOL.evidence[index % DOCUMENTARY_PHOTO_POOL.evidence.length];
  }
  if (r.includes('dönüm') || r.includes('şok')) {
    return DOCUMENTARY_PHOTO_POOL.turning[index % DOCUMENTARY_PHOTO_POOL.turning.length];
  }
  if (r.includes('analiz') || r.includes('uzman')) {
    return DOCUMENTARY_PHOTO_POOL.analysis[index % DOCUMENTARY_PHOTO_POOL.analysis.length];
  }
  return DOCUMENTARY_PHOTO_POOL.conclusion[index % DOCUMENTARY_PHOTO_POOL.conclusion.length];
}

/**
 * Brief türüne ve sahneye göre doğrudan en uygun görseli döndürür
 */
export function getScenePhoto(
  briefType: string,
  role: string,
  visualDesc: string,
  index: number,
  product?: string
): string {
  if (briefType === 'sinema') {
    return matchBestCinemaPhoto(role, visualDesc, index);
  }
  if (briefType === 'belgesel') {
    return matchBestDocumentaryPhoto(role, visualDesc, index, product);
  }
  if (briefType === 'youtube') {
    return matchBestYouTubePhoto(role, visualDesc, index);
  }
  const isRealEstate =
    briefType === 'tanitim' ||
    /gayrimenkul|emlak|rezidans|villa|arsa|konut/i.test(product || '') ||
    /gayrimenkul|emlak|rezidans|villa/i.test(visualDesc || '');

  if (isRealEstate) {
    return matchBestRealPhoto(role, visualDesc, index);
  }

  // Reklam ve diğer modlar için
  if (briefType === 'reklam') {
    return index % 2 === 0
      ? matchBestCinemaPhoto(role, visualDesc, index)
      : matchBestYouTubePhoto(role, visualDesc, index);
  }

  return matchBestCinemaPhoto(role, visualDesc, index);
}

export interface VisualAssetItem {
  url: string;
  name: string;
  category: 'sinema' | 'belgesel' | 'youtube' | 'emlak';
  tag: string;
}

export const ALL_CURATED_ASSETS: VisualAssetItem[] = [
  // 🎙️ Belgesel (Doğa, Tarih, Bilim & Araştırma)
  { url: '/documentary_assets/doc_pyramids_giza.jpg', name: 'Gize Piramitleri ve Çöl (Altın Saat)', category: 'belgesel', tag: 'Arkeoloji' },
  { url: '/cinema_assets/space_earth_orbit.jpg', name: 'Dünya Yörüngesi ve Atmosfer', category: 'belgesel', tag: 'Kozmoloji' },
  { url: '/cinema_assets/space_galaxy.jpg', name: 'Kozmik Sarmal Galaksi', category: 'belgesel', tag: 'Evren' },
  { url: '/cinema_assets/char_detective.jpg', name: 'Arşiv Araştırmacısı / Keşif', category: 'belgesel', tag: 'Araştırma' },
  { url: '/cinema_assets/climax_lightning.jpg', name: 'Doğanın Gücü: Şimşek & Fırtına', category: 'belgesel', tag: 'Doğa' },
  { url: '/cinema_assets/outro_dawn_sunrise.jpg', name: 'Şafak Vakti & Yeni Çağ', category: 'belgesel', tag: 'Tarih' },

  // 🎬 Sinema (21:9 Cinemascope)
  { url: '/cinema_assets/cyber_city_night.jpg', name: 'Siberpunk Mega Kent (Gece)', category: 'sinema', tag: 'Atmosfer' },
  { url: '/cinema_assets/cyber_neon_rain.jpg', name: 'Neon Işıklı Yağmurlu Sokak', category: 'sinema', tag: 'Atmosfer' },
  { url: '/cinema_assets/cyber_towers.jpg', name: 'Fütüristik Gökdelenler', category: 'sinema', tag: 'Atmosfer' },
  { url: '/cinema_assets/space_earth_orbit.jpg', name: 'Dünya Yörüngesi ve Atmosfer', category: 'sinema', tag: 'Uzay' },
  { url: '/cinema_assets/space_nebula.jpg', name: 'Derin Uzay Bulutsusu (Nebula)', category: 'sinema', tag: 'Uzay' },
  { url: '/cinema_assets/char_cyber_hero.jpg', name: 'Siber Kahraman Portresi', category: 'sinema', tag: 'Karakter' },
  { url: '/cinema_assets/char_detective.jpg', name: 'Dedektif (Pardösülü & Gizemli)', category: 'sinema', tag: 'Karakter' },
  { url: '/cinema_assets/char_silhouette.jpg', name: 'Işığa Karşı Gizemli Silüet', category: 'sinema', tag: 'Karakter' },
  { url: '/cinema_assets/char_lone_street.jpg', name: 'Yalnız Gece Yürüyüşü', category: 'sinema', tag: 'Karakter' },
  { url: '/cinema_assets/cyber_corridor.jpg', name: 'Fütüristik Tesis Koridoru', category: 'sinema', tag: 'Keşif' },
  { url: '/cinema_assets/space_galaxy.jpg', name: 'Sarmal Galaksi & Kozmos', category: 'sinema', tag: 'Uzay' },
  { url: '/cinema_assets/action_dark_alley.jpg', name: 'Karanlık Çıkmaz Sokak', category: 'sinema', tag: 'Gerilim' },
  { url: '/cinema_assets/action_sparks.jpg', name: 'Kıvılcımlar & Mekanik Aksiyon', category: 'sinema', tag: 'Aksiyon' },
  { url: '/cinema_assets/action_chase.jpg', name: 'Yüksek Hızlı Takip / Kovalamaca', category: 'sinema', tag: 'Aksiyon' },
  { url: '/cinema_assets/space_stars.jpg', name: 'Yıldız Tarlası & Sonsuzluk', category: 'sinema', tag: 'Uzay' },
  { url: '/cinema_assets/climax_rooftop.jpg', name: 'Çatıda Büyük Yüzleşme (Climax)', category: 'sinema', tag: 'Zirve' },
  { url: '/cinema_assets/climax_lightning.jpg', name: 'Dramatik Şimşek & Fırtına', category: 'sinema', tag: 'Zirve' },
  { url: '/cinema_assets/action_explosion.jpg', name: 'Büyük Patlama & Alevler', category: 'sinema', tag: 'Zirve' },
  { url: '/cinema_assets/climax_fire_portal.jpg', name: 'Ateş Geçidi / Portalı', category: 'sinema', tag: 'Zirve' },
  { url: '/cinema_assets/outro_dawn_sunrise.jpg', name: 'Epik Gün Doğumu / Son Şafak', category: 'sinema', tag: 'Final' },
  { url: '/cinema_assets/outro_cinema_light.jpg', name: 'Sinema Projeksiyon Huzmesi', category: 'sinema', tag: 'Final' },
  { url: '/cinema_assets/outro_epic_horizon.jpg', name: 'Sonsuz Ufuk & Kapanış', category: 'sinema', tag: 'Final' },

  // 🔴 YouTube (16:9 Full HD)
  { url: '/youtube_assets/yt_studio_neon.jpg', name: 'Neon YouTube Yayın Stüdyosu', category: 'youtube', tag: 'Stüdyo' },
  { url: '/youtube_assets/yt_podcast_mic.jpg', name: 'Profesyonel Yayın Mikrofonu', category: 'youtube', tag: 'Podcast' },
  { url: '/youtube_assets/yt_tech_desk.jpg', name: 'İçerik Üretici RGB Setup', category: 'youtube', tag: 'Masaüstü' },
  { url: '/youtube_assets/yt_ai_chip.jpg', name: 'Yapay Zeka İşlemcisi & Çip', category: 'youtube', tag: 'Teknoloji' },
  { url: '/youtube_assets/yt_data_charts.jpg', name: 'Büyük Veri & Analiz Grafikleri', category: 'youtube', tag: 'Veri' },
  { url: '/youtube_assets/yt_creator_workspace.jpg', name: 'Aydınlık Minimal Çalışma Alanı', category: 'youtube', tag: 'Çalışma' },

  // 🏢 Gayrimenkul & Kurumsal
  { url: '/real_assets/hero_residence.jpg', name: 'Lüks Rezidans Kulesi', category: 'emlak', tag: 'Rezidans' },
  { url: '/real_assets/luxury_villa.jpg', name: 'Havuzlu Prestij Villa', category: 'emlak', tag: 'Villa' },
  { url: '/real_assets/01-hero.jpg', name: 'Modern Dış Cephe', category: 'emlak', tag: 'Konut' },
  { url: '/real_assets/02-villa.jpg', name: 'Doğa İçinde Müstakil Villa', category: 'emlak', tag: 'Villa' },
  { url: '/real_assets/modern_map.jpg', name: 'Konum ve Lokasyon Haritası', category: 'emlak', tag: 'Harita' },
  { url: '/real_assets/outro_luxury.jpg', name: 'Kurumsal Ofis & İletişim', category: 'emlak', tag: 'Kapanış' }
];
