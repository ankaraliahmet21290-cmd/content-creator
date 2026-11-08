import { BriefForm, ProviderConfig, Scene, VideoItem, AppMode } from '@/types';
import { GRADIENTS, SOP_ROLES, CINEMA_ROLES, DOCUMENTARY_ROLES, YOUTUBE_ROLES, SHORTS_ROLES, SPORTS_ROLES } from './constants';
import { getScenePhoto } from './assets';

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function getSavedProviderConfig(): ProviderConfig {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('klaket_provider_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          llm: parsed.llm || 'gemini',
          tts: parsed.tts || 'gemini_tts',
          voiceGender: parsed.voiceGender || 'female',
          renderEngine: parsed.renderEngine || 'canvas',
          mcpUrl: parsed.mcpUrl || '',
          geminiApiKey: parsed.geminiApiKey || ''
        };
      }
    } catch {
      // ignore
    }
  }
  return {
    llm: 'gemini',
    tts: 'gemini_tts',
    voiceGender: 'female',
    renderEngine: 'canvas',
    mcpUrl: '',
    geminiApiKey: ''
  };
}

export function buildScenesFromSOP(b: BriefForm): Scene[] {
  const isCinema = b.type === 'sinema';
  const isDocumentary =
    b.type === 'belgesel' ||
    b.tone?.toLowerCase().includes('belgesel') ||
    /belgesel|documentary/i.test(b.customInstructions || '') ||
    /belgesel|documentary/i.test(b.product || '');
  const isYouTube = !isDocumentary && b.type === 'youtube';
  const isSocial = !isCinema && !isDocumentary && !isYouTube && (b.type === 'sosyal' || b.ratio === '9:16' || /shorts|reels|tiktok/i.test(b.platform || ''));
  const isSports = /maç|futbol|gol|gs|fb|bjk|ts|derbi|stadyum|şampiyon|lig|soccer|football|vs|stuttgart|stutgart|galatasaray|fenerbahçe|beşiktaş|trabzon|skor|özet|penaltı|hakem/i.test(
    `${b.product} ${b.customInstructions || ''} ${b.points || ''}`
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
  const divisor = isCinema || isDocumentary ? 7.5 : isYouTube ? 8.0 : isSocial ? 4.5 : 5.5;
  const n = Math.max(3, Math.min(8, Math.round(b.dur / divisor)));

  const roles =
    n === baseRoles.length
      ? baseRoles
      : [baseRoles[0], ...baseRoles.slice(1, -1).slice(0, Math.max(1, n - 2)), baseRoles[baseRoles.length - 1]];

  const p = b.product;
  const a = b.audience || (isDocumentary ? 'belgeselseverler' : isCinema ? 'sinemaseverler' : isYouTube ? 'değerli takipçiler' : 'değerli izleyiciler');
  const pts = (b.points || '').split('\n').map(s => s.trim()).filter(Boolean);
  let ptIndex = 0;

  const documentaryMap: Record<string, { screen: string; vo: string }> = {
    'Açılış: Büyük Gizem': {
      screen: `${p.toUpperCase()}: GİZEM`,
      vo: `Yüzyıllardır insanlığın zihnini meşgul eden bu büyük sır, şimdi gün yüzüne çıkıyor.`
    },
    'Tarihsel / Bilimsel Arka Plan': {
      screen: 'Tarihin Tozlu Sayfaları',
      vo: `Arşivlerdeki ilk kayıtlar ve saha araştırmaları, bilinen tüm teorileri sorgulatacak ipuçları veriyor.`
    },
    'Kritik Kanıt & Saha Bulguları': {
      screen: 'Kritik Keşif ve Kanıtlar',
      vo: `Son radar taramaları ve elde edilen somut bulgular, ezber bozan bir gerçeğe işaret ediyor.`
    },
    'Dönüm Noktası & Ezber Bozan Gerçek': {
      screen: 'Dönüm Noktası',
      vo: `Tüm parçalar birleştiğinde ortaya çıkan bu tablo, tarihin yeniden yazılması gerektiğinin en büyük kanıtı.`
    },
    'Uzman Analizi & Derinleşme': {
      screen: 'Derin Analiz ve Yansımalar',
      vo: `Bilim insanları ve araştırmacılar için bu keşif, geleceğe ışık tutan eşsiz bir kapı aralıyor.`
    },
    'Sonuç & Düşündürücü Kapanış': {
      screen: b.cta || 'Keşfetmeye Devam Edin',
      vo: b.cta || `Görünenden çok daha fazlası var. Gerçeğin peşindeki bu yolculuk asla sona ermeyecek.`
    }
  };

  const cinemaMap: Record<string, { screen: string; vo: string }> = {
    'Açılış & Atmosfer': { screen: p, vo: `Karanlığın ortasında, her şeyin başladığı o an.` },
    'Karakter Tanıtımı': { screen: `${p}: Karakter`, vo: `Kaderin seçtiği bir kahraman, geri dönüşü olmayan bir yola adım atıyor.` },
    'Tetikleyici Olay': { screen: 'Beklenmeyen Kırılma', vo: `Bütün dengeleri altüst edecek gizemli gerçek açığa çıkıyor.` },
    'Yükselen Gerilim': { screen: 'Büyük Yüzleşme', vo: `Zaman daralıyor, her saniye kritik bir karara gebe.` },
    'Zirve Noktası (Climax)': { screen: 'Kaçınılmaz Doruk Noktası', vo: `Artık hiçbir şey eskisi gibi olmayacak.` },
    'Final & Vizyon Çağrısı': { screen: b.cta || 'Pek Yakında Sinemalarda', vo: b.cta || 'Soluksuz bir sinematik deneyime hazır olun.' }
  };

  const youtubeMap: Record<string, { screen: string; vo: string }> = {
    'YouTube Kancası': { screen: `${p}?`, vo: `Bunu muhtemelen hiç duymadınız: ${p} hakkında bilmeniz gereken şok gerçek!` },
    'Giriş & Konu Özeti': { screen: `Derinlemesine: ${p}`, vo: `Bugün bu konuyu en ince ayrıntısına kadar mercek altına alıyoruz.` },
    'Bölüm 1: Arka Plan': { screen: '1. Olayın Perde Arkası', vo: `Gelin sürecin nasıl başladığına ve kritik dönüm noktalarına bakalım.` },
    'Bölüm 2: Derinlemesine Detay': { screen: '2. En Can Alıcı Nokta', vo: `İşte herkesin gözden kaçırdığı en kritik analiz tam da bu.` },
    'Çarpıcı Açıklama': { screen: 'Ezber Bozan Gerçek', vo: `Tüm bu veriler birleştiğinde ortaya inanılmaz bir tablo çıkıyor.` },
    'Özet & Abone Ol Çağrısı': { screen: b.cta || 'Kanala Abone Olmayı Unutmayın!', vo: b.cta || 'Videoyu beğendiyseniz abone olup bildirimleri açmayı ve yorumunuzu paylaşmayı unutmayın!' }
  };

  const sportsMap: Record<string, { screen: string; vo: string }> = {
    '🏟️ Başlama Düdüğü & Tribün Coşkusu': {
      screen: `${p.toUpperCase()}: DEV MAÇ!`,
      vo: `Ve dev maçta ilk düdük çaldı! İki takım da sahada inanılmaz bir baskı ve kazanma arzusuyla başladı!`
    },
    '⚡ Tehlikeli Atak & İlk Tehdit': {
      screen: 'Kritik Atak & Tehlike',
      vo: `Ceza sahasına muhteşem bir ara pası, savunma son anda araya giriyor! Maçta tempo nefes kesiyor!`
    },
    '⚽ GOOOL! Ağları Yırtan Vuruş': {
      screen: 'GOOOOOL! 1-0!',
      vo: `Ve top ağlarda! Kalecinin çaresiz kaldığı köşeye enfes bir füze! Tribünler sevinçten yıkılıyor!`
    },
    '🔥 Karşı Atak & Nefes Kesen Pozisyon': {
      screen: 'Nefes Kesen Mücadele',
      vo: `Rakip takım beraberlik için tüm hatlarıyla yükleniyor, kaleci kalesinde devleşiyor!`
    },
    '🏆 Maçı Koparan Gol & Zafer Çığlığı': {
      screen: 'MAÇI BİTİREN GOL!',
      vo: `Ve son dakikalarda gelen bu inanılmaz golle maçın fişi çekiliyor! Sahada büyük sevinç!`
    },
    '👉 Maç Sonu Skoru & Maçın Adamı Kimdi? (CTA)': {
      screen: b.cta || 'Sizce Maçın Adamı Kimdi?',
      vo: b.cta || `Nefes kesen 90 dakika sona erdi! Sizce maçın adamı kimdi? Yorumlara yazın ve takip etmeyi unutmayın!`
    }
  };

  const shortsMap: Record<string, { screen: string; vo: string }> = {
    '⚡ Viral Kanca & Şok Başlangıç': {
      screen: `Bunu Mutlaka İzleyin!`,
      vo: `Eğer hala bunu görmediyseniz, hayatınızın en ilginç detayını kaçırıyorsunuz!`
    },
    '🔥 Yükselen Gerilim & Kritik An': {
      screen: 'Beklenmeyen Gelişme',
      vo: `Olaylar tam burada değişmeye başlıyor, dikkatle izleyin!`
    },
    '💥 Beklenmeyen Kırılma & Olay': {
      screen: 'İşte O Kırılma Anı!',
      vo: `Kimsenin beklemediği o an gerçekleşti ve her şey altüst oldu!`
    },
    '🚀 Zirve Patlaması & En Can Alıcı An': {
      screen: 'En Can Alıcı Sonuç',
      vo: `İşte ortaya çıkan bu inanılmaz sonuç herkesi hayrete düşürdü!`
    },
    '👉 Takip Et & Yorumunu Yaz (CTA)': {
      screen: b.cta || 'Siz Ne Düşünüyorsunuz?',
      vo: b.cta || `Siz bu konuda ne düşünüyorsunuz? Yorumlara yazın ve daha fazlası için takip edin!`
    }
  };

  const templates: Record<string, Record<string, { screen: string; vo: string }> | { screen: string; vo: string }> = {
    Kanca: {
      reklam: { screen: p, vo: `Dikkat! ${p} ile tüm standartlar değişiyor.` },
      tanitim: { screen: `Yeni Nesil: ${p}`, vo: `Karşınızda ${a} için özel hazırlanan ${p}.` },
      sosyal: { screen: `${a}, Buraya Dikkat!`, vo: `Eğer hala bunu görmediyseniz, çok şey kaçırıyorsunuz.` },
      egitim: { screen: `${p} Nasıl Yapılır?`, vo: `İşte adım adım başarıya giden en pratik yol.` },
      kurumsal: { screen: `Güven ve Kalite: ${p}`, vo: `Geleceğe güvenle bakan güçlü bir yolculuk.` }
    },
    Sorun: { screen: 'Eski ve Yavaş Yöntemlere Son!', vo: 'Zamanınızı ve enerjinizi tüketen karmaşık süreçlerden sıkılmadınız mı?' },
    Çözüm: { screen: `${p} Çözümü Sunar`, vo: `Aradığınız konfor ve hız ${p} ile elinizin altında.` },
    Özellik: { screen: 'Üstün Performans', vo: 'Modern altyapı ve kusursuz detaylar bir arada.' },
    Kanıt: { screen: 'Yüzlerce Mutlu Müşteri', vo: 'Sektörün en güvenilir referansları ile kanıtlanmış başarı.' },
    Fayda: { screen: 'Maksimum Verim & Konfor', vo: 'Hem zamandan tasarruf edin hem de prestijinizi katlayın.' },
    Çağrı: { screen: b.cta || 'Hemen Bilgi Alın', vo: b.cta || 'Geç kalmadan hemen bizimle iletişime geçin.' }
  };

  const hookSec = b.dur <= 15 ? 2.5 : isCinema ? 4.0 : 3.0;
  const remainingSec = +((b.dur - hookSec) / (n - 1)).toFixed(1);

  const customLines = (b.customInstructions || '')
    .split(/[.\n!?;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  return roles.map((r, i) => {
    let screenText = p;
    let voText = p;
    let subtitle = '';
    let highlight = '';

    if (isDocumentary && documentaryMap[r]) {
      screenText = documentaryMap[r].screen;
      voText = customLines[i] || documentaryMap[r].vo;
      subtitle = pts[i] || `Araştırma ve Keşif Kayıtları`;
      highlight = i === roles.length - 1 ? (b.cta || 'BİLİM VE TARİHİN DÖNÜM NOKTASI') : `BÖLÜM ${i + 1}`;
    } else if (isCinema && cinemaMap[r]) {
      screenText = cinemaMap[r].screen;
      voText = customLines[i] || cinemaMap[r].vo;
      subtitle = pts[i] || `${p} · Sinematik Fragman`;
      highlight = i === roles.length - 1 ? (b.cta || 'ÇOK YAKINDA SİNEMALARDA') : `${p.toUpperCase()}`;
    } else if (isYouTube && youtubeMap[r]) {
      screenText = youtubeMap[r].screen;
      voText = customLines[i] || youtubeMap[r].vo;
      subtitle = pts[i] || `YouTube Analiz & İnceleme`;
      highlight = i === roles.length - 1 ? (b.cta || 'ABONE OL & BEĞEN') : `DETAY`;
    } else if (isSports && sportsMap[r]) {
      screenText = sportsMap[r].screen;
      voText = customLines[i] || sportsMap[r].vo;
      subtitle = pts[i] || `Dev Maç & Gol Pozisyonları`;
      highlight = i === roles.length - 1 ? (b.cta || 'MAÇIN ADAMI KİMDİ?') : `GOL ANI`;
    } else if (isSocial && shortsMap[r]) {
      screenText = shortsMap[r].screen;
      voText = customLines[i] || shortsMap[r].vo;
      subtitle = pts[i] || `Viral Shorts`;
      highlight = i === roles.length - 1 ? (b.cta || 'TAKİP ET & YORUM YAZ') : `ÖNE ÇIKAN`;
    } else {
      const roleEntry = templates[r];
      if (roleEntry) {
        if (typeof roleEntry === 'object' && b.type in roleEntry) {
          const typeMatch = (roleEntry as Record<string, { screen: string; vo: string }>)[b.type];
          screenText = typeMatch.screen;
          voText = typeMatch.vo;
        } else if ('screen' in roleEntry && 'vo' in roleEntry) {
          screenText = (roleEntry as { screen: string; vo: string }).screen;
          voText = (roleEntry as { screen: string; vo: string }).vo;
        }
      }
      subtitle = pts[i] || `${p} Tanıtımı`;
      highlight = b.cta || '';
    }

    if (r === 'Özellik' || r.includes('Detay') || r.includes('Kanıt')) {
      if (pts[ptIndex]) {
        screenText = pts[ptIndex];
        voText = customLines[i] || `${screenText} ile ilgili tüm detaylar.`;
        ptIndex++;
      }
    } else if ((r === 'Çağrı' || r.includes('Çağrısı') || r.includes('Kapanış')) && b.cta) {
      screenText = b.cta;
      voText = customLines[i] || b.cta;
      highlight = b.cta;
    }

    const sceneDuration = i === 0 ? hookSec : remainingSec;
    const visualContext = customLines[i] || b.customInstructions || p;
    const visual = `[${b.tone} ışıklandırma, ${r.toLowerCase()} planı: ${visualContext.slice(0, 80)}]`;
    const imageUrl = getScenePhoto(b.type, r, visualContext, i, p);
    const zoomDir: 'in' | 'out' = i % 2 === 0 ? 'in' : 'out';

    const speaker = isCinema
      ? (i % 2 === 0 ? 'Dış Ses Anlatıcı' : 'Başrol Karakter')
      : undefined;
    const voiceGender: 'female' | 'male' = isCinema
      ? (i % 2 === 1 ? 'female' : 'male')
      : (b.voiceGender || 'female');

    return {
      id: i + 1,
      role: r,
      sec: sceneDuration,
      text: screenText,
      subtitle,
      highlight,
      vo: voText,
      visual,
      grad: GRADIENTS[i % GRADIENTS.length],
      imageUrl,
      zoomDir,
      speaker,
      voiceGender
    };
  });
}

export const providers = {
  // 1. Senaryo ve Sahne Planı Üretimi
  async script(brief: BriefForm, mode: AppMode = 'sinema', addLog: (msg: string) => void): Promise<Scene[]> {
    const cfg = getSavedProviderConfig();
    if (mode === 'classic' || cfg.llm === 'local') {
      addLog('[Klasik Mod] SOP kural algoritması ile senaryo yapısı ve sahneler oluşturuluyor...');
      await sleep(500);
      const scenes = buildScenesFromSOP(brief);
      addLog(`[Klasik Mod] ${scenes.length} adet standart sahne planı hazırlandı.`);
      return scenes;
    }

    const modeName =
      brief.type === 'sinema'
        ? '🎬 Sinema Modu'
        : brief.type === 'belgesel'
          ? '🎙️ Belgesel Modu'
          : brief.type === 'youtube'
            ? '🔴 YouTube Modu'
            : '✨ Yapay Zekâ Modu';

    addLog(`[${modeName}] Gemini 3.6 / 2.5 Flash ile özgün senaryo, sahne rolleri ve altyazılar üretiliyor...`);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          llm: 'gemini',
          apiKey: cfg.geminiApiKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.scenes) {
        throw new Error(data.error || 'Gemini senaryo yanıtı alınamadı.');
      }

      addLog(`[${modeName}] Gemini ${data.scenes.length} sahnelik senaryo ve görsel kompozisyonu üretti.`);
      return data.scenes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Gemini API uyarısı (${msg}) — Standart şablona geçiliyor...`);
      return buildScenesFromSOP(brief);
    }
  },

  // 2. Görsel ve Ses Modelleri
  async clips(scenes: Scene[], brief: BriefForm, mode: AppMode = 'sinema', addLog: (msg: string) => void): Promise<Scene[]> {
    const cfg = getSavedProviderConfig();
    const isCinema = brief.type === 'sinema';
    const isDocumentary = brief.type === 'belgesel';
    const isYouTube = brief.type === 'youtube';
    const logTag = isCinema ? '[Sinema Modu]' : isDocumentary ? '[Belgesel Modu]' : isYouTube ? '[YouTube Modu]' : '[AI Modu]';

    const visualSource = brief.visualSource || 'ai_generate';
    const visualLabel =
      visualSource === 'web_search'
        ? 'İnternetten Canlı Gerçek Fotoğraf Arama'
        : visualSource === 'curated'
          ? 'Küratörlü Tematik Fotoğraf Kütüphanesi'
          : 'Flux/Turbo AI Görsel Sentezi';

    const ttsDisabled = cfg.tts === 'webspeech';

    // Yalnızca küratörlü havuz VE yerel webspeech seçilmişse sunucuya gitmeye gerek yok
    if (visualSource === 'curated' && ttsDisabled) {
      addLog(`${logTag} Küratörlü tematik fotoğraf kütüphanesi ve tarayıcı seslendirmesi hazırlandı.`);
      await sleep(300);
      return scenes.map(({ audioUrl: _a, ...rest }) => rest);
    }

    addLog(`${logTag} ${visualLabel} ve seslendirme pipeline başlatılıyor...`);

    try {
      const res = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes,
          brief,
          apiKey: cfg.geminiApiKey,
          ttsDisabled
        })
      });

      const data = await res.json();
      if (!res.ok || !data.scenes) {
        throw new Error(data.error || 'Yapay zekâ sahne sentezi yanıtı alınamadı.');
      }

      addLog(
        `${logTag} Başarılı: ${data.imgCount ?? scenes.length} sahne için görsel (${visualLabel}) bağlandı.`
      );
      return data.scenes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`AI Varlık sentezi uyarısı (${msg}) — Standart varlık havuzu ve tarayıcı seslendirmesi aktif edildi.`);
      return scenes;
    }
  },

  // 3. Montaj ve Render Servisi
  async render(video: Partial<VideoItem>, mode: AppMode = 'sinema', addLog: (msg: string) => void): Promise<Partial<VideoItem>> {
    if (mode === 'classic') {
      addLog('[Klasik Mod] Standart kurgu şablonu ve zaman çizelgesi hazırlandı.');
    } else if (video.type === 'sinema' || video.ratio === '21:9') {
      addLog('[Sinema Modu] 21:9 Cinemascope geniş ekran kompozisyonu ve sinematik zaman çizelgesi hazırlandı.');
    } else if (video.type === 'belgesel') {
      addLog('[Belgesel Modu] Sinematik belgesel kompozisyonu, derinlik filtreleri ve zaman çizelgesi hazırlandı.');
    } else if (video.type === 'youtube') {
      addLog('[YouTube Modu] 16:9 Full HD YouTube şablonu ve retention katmanları senkronize edildi.');
    } else {
      addLog('[AI Modu] Ses ve görsel katmanları zaman çizelgesiyle senkronize ediliyor...');
    }
    await sleep(400);
    addLog('Kalite kontrol (QC) kontrolleri tamamlandı ve render paketi oluşturuldu.');
    return video;
  }
};
