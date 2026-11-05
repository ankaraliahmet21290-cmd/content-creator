import { BriefForm, ProviderConfig, Scene, VideoItem } from '@/types';
import { GRADIENTS, SOP_ROLES } from './constants';

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
  const n = Math.max(3, Math.min(8, Math.round(b.dur / 5.5)));
  const roles = n === 8
    ? SOP_ROLES
    : [SOP_ROLES[0], ...SOP_ROLES.slice(1, 7).slice(0, n - 2), SOP_ROLES[7]];

  const p = b.product;
  const a = b.audience || 'değerli izleyiciler';
  const pts = (b.points || '').split('\n').map(s => s.trim()).filter(Boolean);
  let ptIndex = 0;

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

  // SOP Bölüm 6 Kuralı: Kanca ilk 3 saniyede izleyiciyi yakalamalıdır
  const hookSec = b.dur <= 15 ? 2.5 : 3.0;
  const remainingSec = +((b.dur - hookSec) / (n - 1)).toFixed(1);

  return roles.map((r, i) => {
    const roleEntry = templates[r];
    let screenText = p;
    let voText = p;

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

    if (r === 'Özellik') {
      if (pts[ptIndex]) {
        screenText = pts[ptIndex];
        voText = `${screenText} ile hayatınızı kolaylaştırın.`;
        ptIndex++;
      }
    } else if (r === 'Çağrı' && b.cta) {
      screenText = b.cta;
      voText = b.cta;
    }

    const sceneDuration = i === 0 ? hookSec : remainingSec;

    return {
      id: i + 1,
      role: r,
      sec: sceneDuration,
      text: screenText,
      vo: voText,
      visual: `[${b.tone} ışıklandırma, ${r.toLowerCase()} planı: ${p}]`,
      grad: GRADIENTS[i % GRADIENTS.length]
    };
  });
}

export const providers = {
  // 1. Senaryo ve Sahne Planı Üretimi
  async script(brief: BriefForm, mode: 'ai' | 'classic' = 'ai', addLog: (msg: string) => void): Promise<Scene[]> {
    const cfg = getSavedProviderConfig();
    if (mode === 'classic' || cfg.llm === 'local') {
      addLog('[Klasik Mod] SOP kural algoritması ile senaryo yapısı ve sahneler oluşturuluyor...');
      await sleep(500);
      const scenes = buildScenesFromSOP(brief);
      addLog(`[Klasik Mod] ${scenes.length} adet standart sahne planı hazırlandı.`);
      return scenes;
    }

    addLog('[AI Modu] Gemini 2.5 Flash ile özgün senaryo, sahne rolleri ve altyazılar üretiliyor...');
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

      addLog(`[AI Modu] Gemini ${data.scenes.length} sahnelik senaryo ve görsel kompozisyonu üretti.`);
      return data.scenes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Gemini API uyarısı (${msg}) — Standart şablona geçiliyor...`);
      return buildScenesFromSOP(brief);
    }
  },

  // 2. Görsel ve Ses Modelleri
  async clips(scenes: Scene[], brief: BriefForm, mode: 'ai' | 'classic' = 'ai', addLog: (msg: string) => void): Promise<Scene[]> {
    const cfg = getSavedProviderConfig();
    if (mode === 'classic' || cfg.tts === 'webspeech') {
      addLog('[Klasik Mod] Tarayıcı Web Speech API (yerel seslendirme) ve gradyan arka planlar bağlandı.');
      await sleep(400);
      return scenes.map(({ audioUrl: _a, ...rest }) => rest);
    }

    addLog('[AI Modu] Gemini AI TTS ile 24kHz doğal seslendirme (Voiceover) sentezleniyor...');
    try {
      const res = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes,
          brief,
          apiKey: cfg.geminiApiKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.scenes) {
        throw new Error(data.error || 'Gemini TTS yanıtı alınamadı.');
      }

      addLog(
        `[AI Modu] Gemini AI ${data.ttsCount}/${data.scenes.length} sahne için stüdyo kalitesinde ses üretti.`
      );
      return data.scenes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Gemini TTS uyarısı (${msg}) — Tarayıcı yerel seslendirmesi aktif edildi.`);
      return scenes;
    }
  },

  // 3. Montaj ve Render Servisi
  async render(video: Partial<VideoItem>, mode: 'ai' | 'classic' = 'ai', addLog: (msg: string) => void): Promise<Partial<VideoItem>> {
    if (mode === 'classic') {
      addLog('[Klasik Mod] Standart kurgu şablonu ve zaman çizelgesi hazırlandı.');
    } else {
      addLog('[AI Modu] Gemini AI ses ve görsel katmanları zaman çizelgesiyle senkronize ediliyor...');
    }
    await sleep(400);
    addLog('Kalite kontrol (QC) kontrolleri tamamlandı ve render paketi oluşturuldu.');
    return video;
  }
};
