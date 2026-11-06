'use client';

import { useState, useEffect, useCallback } from 'react';
import { BriefForm as IBriefForm, Preset, Scene, VideoItem, AppMode } from '@/types';
import { INITIAL_FORM, TYPES, PRESETS } from '@/lib/constants';
import { providers } from '@/lib/providers';
import { Header } from '@/components/Header';
import { BriefForm } from '@/components/BriefForm';
import { Player } from '@/components/Player';
import { VideoGrid } from '@/components/VideoGrid';
import { ProviderModal } from '@/components/ProviderModal';
import { LogModal } from '@/components/LogModal';
import { StoryboardDesigner } from '@/components/StoryboardDesigner';
import { GuideModal } from '@/components/GuideModal';

import defaultShowcase from '@/lib/showcaseVideo.json';

export default function StudioPage() {
  const [form, setForm] = useState<IBriefForm>(INITIAL_FORM);
  const [mode, setMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('klaket_app_mode') as AppMode | null;
      if (savedMode) return savedMode;
    }
    return 'sinema';
  });
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('klaket_sop_vids');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return defaultShowcase ? [defaultShowcase as VideoItem] : [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('klaket_sop_vids');
        if (saved) {
          const parsed = JSON.parse(saved) as VideoItem[];
          const ready = parsed.find(v => v.status === 'Hazır');
          if (ready) return ready.id;
        }
      } catch {
        // ignore
      }
    }
    return (defaultShowcase as VideoItem)?.id || null;
  });
  const [formError, setFormError] = useState('');
  const [isProducing, setIsProducing] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('klaket_theme') as 'dark' | 'light' | null;
      if (savedTheme) return savedTheme;
    }
    return 'light';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeLogModal, setActiveLogModal] = useState<VideoItem | null>(null);
  const [mobileTab, setMobileTab] = useState<'brief' | 'stage' | 'videos'>('brief');

  // Tema Değişimi
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('klaket_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Mod Değişimi (Sinema / YouTube / Reklam / Klasik)
  const handleToggleMode = useCallback((newMode: AppMode) => {
    setMode(newMode);
    try {
      localStorage.setItem('klaket_app_mode', newMode);
    } catch {
      // ignore
    }

    if (newMode === 'sinema') {
      const p = PRESETS.find(x => x.data.type === 'sinema') || PRESETS[0];
      setForm({ ...p.data });
    } else if (newMode === 'belgesel') {
      const p = PRESETS.find(x => x.data.type === 'belgesel') || PRESETS[1];
      setForm({ ...p.data });
    } else if (newMode === 'youtube') {
      const p = PRESETS.find(x => x.data.type === 'youtube') || PRESETS[2];
      setForm({ ...p.data });
    } else if (newMode === 'reklam') {
      const p = PRESETS.find(x => x.data.type === 'reklam') || PRESETS[5];
      setForm({ ...p.data });
    } else if (newMode === 'classic') {
      setForm(prev => ({ ...prev, type: 'tanitim' }));
    }
  }, []);

  // LocalStorage Senkronizasyonu
  useEffect(() => {
    const readyVideos = videos.filter(v => v.status === 'Hazır');
    try {
      localStorage.setItem('klaket_sop_vids', JSON.stringify(readyVideos));
    } catch {
      try {
        // Kota aşılırsa ses verisi olmadan senaryo ve görselleri sakla
        const compact = readyVideos.map(v => ({
          ...v,
          scenes: v.scenes.map(({ audioUrl: _a, ...rest }) => rest)
        }));
        localStorage.setItem('klaket_sop_vids', JSON.stringify(compact));
      } catch {
        // ignore
      }
    }
  }, [videos]);

  const updateFormField = useCallback(<K extends keyof IBriefForm>(field: K, value: IBriefForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const patchVideo = useCallback((id: string, patch: Partial<VideoItem>) => {
    setVideos(list => list.map(v => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  // Şablon Seçildiğinde
  const handleSelectPreset = useCallback((preset: Preset) => {
    setForm({ ...preset.data });
    setFormError('');
  }, []);

  // SOP Üretim Akışı
  const produceVideo = useCallback(async (brief: IBriefForm, targetMode: AppMode = mode) => {
    setIsProducing(true);
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const modeLabel =
      targetMode === 'sinema'
        ? '🎬 Sinema Filmi Modu'
        : targetMode === 'belgesel'
        ? '🎙️ Sinematik Belgesel Modu'
        : targetMode === 'youtube'
        ? '🔴 YouTube Video Modu'
        : targetMode === 'reklam'
        ? '📢 Ticari Reklam Modu'
        : '⚡ Klasik Şablon Modu';
    const logList: string[] = [`[${new Date().toLocaleTimeString()}] ${modeLabel} ile video üretim süreci başlatıldı.`];

    const addLog = (msg: string) => {
      const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
      logList.push(entry);
      patchVideo(id, { logs: [...logList] });
    };

    const newVideo: VideoItem = {
      id,
      ...brief,
      mode: targetMode,
      title: `${brief.product} – ${TYPES[brief.type]}`,
      status: 'Senaryo Yazılıyor',
      stage: 'senaryo',
      progress: 10,
      scenes: [],
      logs: logList,
      created: new Date().toLocaleString('tr-TR')
    };

    setVideos(prev => [newVideo, ...prev]);

    try {
      // 1. Senaryo Üretimi (AI veya Klasik)
      patchVideo(id, { progress: 25, status: 'Senaryo & Sahne Planlanıyor' });
      const scenes = await providers.script(brief, targetMode, addLog);

      // 2. Görsel & Ses (TTS) Varlık Sentezleme
      patchVideo(id, {
        progress: 60,
        status: 'Görsel & Ses Üretiliyor',
        scenes,
        stage: 'sahneler'
      });
      const enrichedScenes = await providers.clips(scenes, brief, targetMode, addLog);

      // 3. Montaj & Render Pipeline
      patchVideo(id, {
        progress: 85,
        status: 'Render & Kalite Kontrolü',
        scenes: enrichedScenes,
        stage: 'render'
      });
      await providers.render({ ...newVideo, scenes: enrichedScenes }, targetMode, addLog);

      // 4. Kalite Kontrolü Onaylandı ve Hazır
      addLog('Video montajı başarıyla tamamlandı ve kalite kontrol onayından geçti.');
      patchVideo(id, {
        progress: 100,
        status: 'Hazır',
        stage: 'hazir',
        scenes: enrichedScenes,
        logs: [...logList]
      });

      setSelectedId(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Hata oluştu: ${msg}`);
      patchVideo(id, { status: 'Başarısız', progress: 0, stage: 'hata' });
    } finally {
      setIsProducing(false);
    }
  }, [mode, patchVideo]);

  // Storyboard Sahne Tasarımı Akışı (Adım 1: Senaryo ve Sahneleri Hazırla)
  const produceStoryboard = useCallback(async (brief: IBriefForm, targetMode: AppMode = mode) => {
    setIsProducing(true);
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const modeLabel =
      targetMode === 'sinema'
        ? '🎬 Sinema Filmi'
        : targetMode === 'belgesel'
        ? '🎙️ Sinematik Belgesel'
        : targetMode === 'youtube'
        ? '🔴 YouTube Videosu'
        : targetMode === 'reklam'
        ? '📢 Reklam Filmi'
        : '⚡ Klasik Video';
    const logList: string[] = [`[${new Date().toLocaleTimeString()}] ${modeLabel} için Storyboard sahne tasarım süreci başlatıldı.`];

    const addLog = (msg: string) => {
      const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
      logList.push(entry);
      patchVideo(id, { logs: [...logList] });
    };

    const newVideo: VideoItem = {
      id,
      ...brief,
      mode: targetMode,
      title: `${brief.product} – ${TYPES[brief.type]}`,
      status: 'Senaryo & Sahne Planlanıyor',
      stage: 'senaryo',
      progress: 30,
      scenes: [],
      logs: logList,
      created: new Date().toLocaleString('tr-TR')
    };

    setVideos(prev => [newVideo, ...prev]);
    setSelectedId(id);

    try {
      addLog('Yapay zekâ sahne planlarını, replikleri, kamera açılarını ve film karelerini oluşturuyor...');
      const scenes = await providers.script(brief, targetMode, addLog);

      addLog(`Storyboard hazırlandı (${scenes.length} sahne). Sahne Tasarım Masası açıldı.`);
      patchVideo(id, {
        status: 'Tasarım Bekliyor (Storyboard)',
        stage: 'storyboard',
        progress: 50,
        scenes,
        logs: [...logList]
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Hata oluştu: ${msg}`);
      patchVideo(id, { status: 'Başarısız', progress: 0, stage: 'hata' });
    } finally {
      setIsProducing(false);
    }
  }, [mode, patchVideo]);

  // Storyboard Onaylanıp Final Render Başlatıldığında (Adım 2: Montaj & Render)
  const finalizeStoryboardRender = useCallback(async (videoId: string, designedScenes: Scene[]) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    setIsProducing(true);
    const logList = [...(video.logs || [])];
    const addLog = (msg: string) => {
      const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
      logList.push(entry);
      patchVideo(videoId, { logs: [...logList] });
    };

    addLog('Kullanıcı sahne tasarımını onayladı. Video montaj ve ses miksaj pipeline başlatılıyor...');
    patchVideo(videoId, {
      status: 'Görsel & Ses Üretiliyor',
      stage: 'sahneler',
      progress: 65,
      scenes: designedScenes
    });

    try {
      // 1. Görsel & Ses (TTS) Varlık Sentezleme
      const enrichedScenes = await providers.clips(designedScenes, video, video.mode || mode, addLog);

      // 2. Montaj & Render Pipeline
      patchVideo(videoId, {
        progress: 85,
        status: 'Render & Kalite Kontrolü',
        scenes: enrichedScenes,
        stage: 'render'
      });
      await providers.render({ ...video, scenes: enrichedScenes }, video.mode || mode, addLog);

      // 3. Kalite Kontrolü Onaylandı ve Hazır
      addLog('Video montajı başarıyla tamamlandı ve kalite kontrol onayından geçti.');
      patchVideo(videoId, {
        progress: 100,
        status: 'Hazır',
        stage: 'hazir',
        scenes: enrichedScenes,
        logs: [...logList]
      });
      setSelectedId(videoId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Render hatası: ${msg}`);
      patchVideo(videoId, { status: 'Başarısız', progress: 0, stage: 'hata' });
    } finally {
      setIsProducing(false);
    }
  }, [videos, mode, patchVideo]);

  // Hızlı Tek Tıkla Üret
  const handleSubmit = useCallback(() => {
    if (!form.product.trim()) {
      setFormError('Lütfen ürün veya konu başlığını giriniz.');
      return;
    }
    if (form.dur < 5 || form.dur > 300) {
      setFormError('Süre 5 ile 300 saniye arasında olmalıdır.');
      return;
    }
    setFormError('');
    setMobileTab('stage');
    produceVideo({ ...form, product: form.product.trim() }, mode);
  }, [form, mode, produceVideo]);

  // Storyboard Modunda Üret
  const handleSubmitStoryboard = useCallback(() => {
    if (!form.product.trim()) {
      setFormError('Lütfen ürün veya konu başlığını giriniz.');
      return;
    }
    if (form.dur < 5 || form.dur > 300) {
      setFormError('Süre 5 ile 300 saniye arasında olmalıdır.');
      return;
    }
    setFormError('');
    setMobileTab('stage');
    produceStoryboard({ ...form, product: form.product.trim() }, mode);
  }, [form, mode, produceStoryboard]);

  // Sahne Revizyon Güncellemesi (Player içinden)
  const handleUpdateScene = useCallback((videoId: string, updatedScene: Scene) => {
    setVideos(prev =>
      prev.map(v => {
        if (v.id !== videoId) return v;
        const newScenes = v.scenes.map(s => (s.id === updatedScene.id ? updatedScene : s));
        return { ...v, scenes: newScenes };
      })
    );
  }, []);

  // Sahne Listesi Güncellemesi (Storyboard içinden)
  const handleUpdateStoryboardScenes = useCallback((videoId: string, newScenes: Scene[]) => {
    setVideos(prev =>
      prev.map(v => (v.id === videoId ? { ...v, scenes: newScenes } : v))
    );
  }, []);

  const activeVideo =
    videos.find(v => v.id === selectedId) ||
    videos.find(v => v.stage === 'storyboard') ||
    videos.find(v => v.status === 'Hazır');

  const isStoryboardActive = activeVideo?.stage === 'storyboard';
  const isPlayerActive = activeVideo?.status === 'Hazır';

  return (
    <div className="wrap">
      <Header
        theme={theme}
        mode={mode}
        onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        onToggleMode={handleToggleMode}
        onOpenSettings={() => setShowSettings(true)}
        onOpenGuide={() => setShowGuide(true)}
      />

      {/* Mobil Tab Çubuğu (Yalnızca Tablet / Telefonda Görünür) */}
      <nav className="mobile-tabs" role="tablist" aria-label="Mobil Sayfa Sekmeleri">
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'brief' ? 'active' : ''}`}
          onClick={() => setMobileTab('brief')}
          role="tab"
          aria-selected={mobileTab === 'brief'}
        >
          <span>✍️ Brief & Oluştur</span>
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'stage' ? 'active' : ''}`}
          onClick={() => setMobileTab('stage')}
          role="tab"
          aria-selected={mobileTab === 'stage'}
        >
          <span>🎬 Sahne & Oynatıcı</span>
          {(isStoryboardActive || isPlayerActive || isProducing) && (
            <span className="mobile-tab-badge-dot" title="Aktif Video / Sahne Mevcut" />
          )}
        </button>
        <button
          type="button"
          className={`mobile-tab-btn ${mobileTab === 'videos' ? 'active' : ''}`}
          onClick={() => setMobileTab('videos')}
          role="tab"
          aria-selected={mobileTab === 'videos'}
        >
          <span>📁 Videolar</span>
          {videos.length > 0 && (
            <span className="mobile-tab-count">{videos.length}</span>
          )}
        </button>
      </nav>

      <div className="grid">
        {/* Sol Panel: Video Brief Formu */}
        <div className={`col-brief ${mobileTab !== 'brief' ? 'mobile-hidden' : ''}`}>
          <BriefForm
            form={form}
            mode={mode}
            isProducing={isProducing}
            formError={formError}
            onUpdateField={updateFormField}
            onSelectPreset={handleSelectPreset}
            onSubmit={handleSubmit}
            onSubmitStoryboard={handleSubmitStoryboard}
          />
        </div>

        {/* Sağ Panel: Aktif Video Oynatıcısı, Storyboard Tasarımcısı & Video Listesi */}
        <main className="col-main">
          {/* Sahne / Storyboard / Oynatıcı Alanı */}
          <div className={`stage-wrapper ${mobileTab !== 'stage' ? 'mobile-hidden' : ''}`}>
            {isStoryboardActive && activeVideo ? (
              <StoryboardDesigner
                video={activeVideo}
                onUpdateScenes={s => handleUpdateStoryboardScenes(activeVideo.id, s)}
                onConfirmAndRender={s => finalizeStoryboardRender(activeVideo.id, s)}
                onCancel={() => setSelectedId(null)}
                isRendering={isProducing}
              />
            ) : isPlayerActive && activeVideo ? (
              <section className="panel" style={{ marginBottom: 20 }}>
                <div className="panel-hdr">
                  <div>
                    <h2>{activeVideo.title}</h2>
                    <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>
                      {`${activeVideo.platform} · ${activeVideo.ratio} · ${activeVideo.dur} sn · ${activeVideo.tone} · ${activeVideo.lang}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => setActiveLogModal(activeVideo)}
                    >
                      📋 İşlem Kaydı (Logs)
                    </button>
                  </div>
                </div>

                <Player
                  video={activeVideo}
                  onUpdateScene={handleUpdateScene}
                />
              </section>
            ) : (
              <div className="stage-empty-card">
                <div style={{ fontSize: 44, marginBottom: 10 }}>🎬</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Şu Anda Aktif Sahne veya Oynatıcı Yok</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--mute)', maxWidth: 400 }}>
                  Yeni bir sinema filmi, belgesel veya YouTube videosu üretmek için brief formunu doldurun veya kayıtlı videolardan birini seçin.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => setMobileTab('brief')}
                  >
                    ✍️ Brief Formuna Git
                  </button>
                  {videos.length > 0 && (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setMobileTab('videos')}
                    >
                      📁 Kayıtlı Videoları Gör ({videos.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Üretilen Videolar Galerisi */}
          <div className={`videos-wrapper ${mobileTab !== 'videos' ? 'mobile-hidden' : ''}`}>
            <VideoGrid
              videos={videos}
              onPreview={v => {
                setSelectedId(v.id);
                setMobileTab('stage');
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              onReProduce={v => {
                produceVideo({ ...v }, v.mode || mode);
                setMobileTab('stage');
              }}
              onOpenLogs={v => setActiveLogModal(v)}
              onDelete={id => {
                setVideos(list => list.filter(item => item.id !== id));
                if (selectedId === id) setSelectedId(null);
              }}
              onClearAll={() => {
                if (confirm('Tüm video geçmişi temizlensin mi?')) {
                  setVideos([]);
                  setSelectedId(null);
                }
              }}
            />
          </div>
        </main>
      </div>

      {/* Log Modalı */}
      {activeLogModal && (
        <LogModal
          video={activeLogModal}
          onClose={() => setActiveLogModal(null)}
        />
      )}

      {/* Sağlayıcı & MCP Modalı */}
      {showSettings && (
        <ProviderModal onClose={() => setShowSettings(false)} />
      )}

      {/* Kullanım Kılavuzu Modalı (kullanim.md) */}
      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}
