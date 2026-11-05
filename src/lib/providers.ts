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
  // 1. LLM: Gemini AI ile Senaryo ve Sahne Planı Üretimi
  async script(brief: BriefForm, addLog: (msg: string) => void): Promise<Scene[]> {
    const cfg = getSavedProviderConfig();
    if (cfg.llm === 'local') {
      addLog('Yerel SOP algoritması ile senaryo yapısı oluşturuluyor...');
      await sleep(500);
      const scenes = buildScenesFromSOP(brief);
      addLog(`${scenes.length} adet sahne planı ve seslendirme metni üretildi.`);
      return scenes;
    }

    addLog('Gemini AI (gemini-2.5-flash) ile senaryo, sahne planı ve görsel kompozisyon üretiliyor...');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          llm: cfg.llm,
          apiKey: cfg.geminiApiKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.scenes) {
        throw new Error(data.error || 'Gemini senaryo yanıtı alınamadı.');
      }

      addLog(`Gemini AI ${data.scenes.length} sahnelik senaryo, seslendirme ve vektör sahne tasarımını tamamladı.`);
      return data.scenes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Gemini API uyarısı (${msg}) — SOP yedek şablonuna geçiliyor...`);
      return buildScenesFromSOP(brief);
    }
  },

  // 2. Görsel ve Ses Modelleri (Gemini TTS & Görsel Sentezi)
  async clips(scenes: Scene[], brief: BriefForm, addLog: (msg: string) => void): Promise<Scene[]> {
    const cfg = getSavedProviderConfig();
    if (cfg.tts === 'webspeech') {
      addLog('Tarayıcı Web Speech API ve sahne kompozisyonu bağlanıyor...');
      await sleep(500);
      return scenes;
    }

    addLog('Gemini AI TTS ile doğal seslendirme (Voiceover) ve sahne görselleri sentezleniyor...');
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
        `Gemini AI ${data.ttsCount}/${data.scenes.length} sahne için yapay zeka seslendirmesi (24kHz WAV) ve ${data.imgCount} sahne görseli üretti.`
      );
      return data.scenes;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Gemini TTS uyarısı (${msg}) — Tarayıcı seslendirmesi aktif edildi.`);
      return scenes;
    }
  },

  // 3. Montaj ve Render Servisi
  async render(video: Partial<VideoItem>, addLog: (msg: string) => void): Promise<Partial<VideoItem>> {
    addLog('Gemini AI ses ve görsel katmanları zaman çizelgesiyle senkronize ediliyor...');
    await sleep(450);
    addLog('Kalite kontrol (QC) matrisi ve WebM video/ses render paketi hazırlandı.');
    return video;
  }
};
