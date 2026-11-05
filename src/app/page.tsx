'use client';

import { useState, useEffect, useCallback } from 'react';
import { BriefForm as IBriefForm, Preset, Scene, VideoItem } from '@/types';
import { INITIAL_FORM, TYPES } from '@/lib/constants';
import { providers } from '@/lib/providers';
import { Header } from '@/components/Header';
import { BriefForm } from '@/components/BriefForm';
import { Player } from '@/components/Player';
import { VideoGrid } from '@/components/VideoGrid';
import { ProviderModal } from '@/components/ProviderModal';
import { LogModal } from '@/components/LogModal';

export default function StudioPage() {
  const [form, setForm] = useState<IBriefForm>(INITIAL_FORM);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [isProducing, setIsProducing] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [activeLogModal, setActiveLogModal] = useState<VideoItem | null>(null);

  // Sayfa ilk yüklendiğinde LocalStorage'dan videoları ve temayı çek
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('klaket_theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
      const savedVideos = localStorage.getItem('klaket_sop_vids');
      if (savedVideos) {
        const parsed: VideoItem[] = JSON.parse(savedVideos);
        setVideos(parsed);
        const firstReady = parsed.find(v => v.status === 'Hazır');
        if (firstReady) setSelectedId(firstReady.id);
      }
    } catch {
      // ignore
    }
  }, []);

  // Tema Değişimi
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('klaket_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

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
  const produceVideo = useCallback(async (brief: IBriefForm) => {
    setIsProducing(true);
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const logList: string[] = [`[${new Date().toLocaleTimeString()}] SOP video üretim süreci başlatıldı.`];

    const addLog = (msg: string) => {
      const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
      logList.push(entry);
      patchVideo(id, { logs: [...logList] });
    };

    const newVideo: VideoItem = {
      id,
      ...brief,
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
      // 1. LLM Senaryo Üretimi
      patchVideo(id, { progress: 25, status: 'Senaryo & Sahne Planlanıyor' });
      const scenes = await providers.script(brief, addLog);

      // 2. Görsel & Ses (TTS) Varlık Sentezleme
      patchVideo(id, {
        progress: 60,
        status: 'Görsel & Ses Üretiliyor',
        scenes,
        stage: 'sahneler'
      });
      const enrichedScenes = await providers.clips(scenes, brief, addLog);

      // 3. Montaj & Render Pipeline
      patchVideo(id, {
        progress: 85,
        status: 'Render & Kalite Kontrolü',
        scenes: enrichedScenes,
        stage: 'render'
      });
      await providers.render({ ...newVideo, scenes: enrichedScenes }, addLog);

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
  }, [patchVideo]);

  // Form Gönder
  const handleSubmit = useCallback(() => {
    if (!form.product.trim()) {
      setFormError('Lütfen ürün veya konu başlığını giriniz.');
      return;
    }
    if (form.dur < 5 || form.dur > 120) {
      setFormError('Süre 5 ile 120 saniye arasında olmalıdır.');
      return;
    }
    setFormError('');
    produceVideo({ ...form, product: form.product.trim() });
  }, [form, produceVideo]);

  // Sahne Revizyon Güncellemesi
  const handleUpdateScene = useCallback((videoId: string, updatedScene: Scene) => {
    setVideos(prev =>
      prev.map(v => {
        if (v.id !== videoId) return v;
        const newScenes = v.scenes.map(s => (s.id === updatedScene.id ? updatedScene : s));
        return { ...v, scenes: newScenes };
      })
    );
  }, []);

  const selectedVideo =
    videos.find(v => v.id === selectedId && v.status === 'Hazır') ||
    videos.find(v => v.status === 'Hazır');

  return (
    <div className="wrap">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="grid">
        {/* Sol Panel: Video Brief Formu */}
        <BriefForm
          form={form}
          isProducing={isProducing}
          formError={formError}
          onUpdateField={updateFormField}
          onSelectPreset={handleSelectPreset}
          onSubmit={handleSubmit}
        />

        {/* Sağ Panel: Aktif Video Oynatıcısı & Video Listesi */}
        <main>
          {selectedVideo ? (
            <section className="panel" style={{ marginBottom: 20 }}>
              <div className="panel-hdr">
                <div>
                  <h2>{selectedVideo.title}</h2>
                  <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>
                    {`${selectedVideo.platform} · ${selectedVideo.ratio} · ${selectedVideo.dur} sn · ${selectedVideo.tone} · ${selectedVideo.lang}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => setActiveLogModal(selectedVideo)}
                  >
                    📋 İşlem Kaydı (Logs)
                  </button>
                </div>
              </div>

              <Player
                video={selectedVideo}
                onUpdateScene={handleUpdateScene}
              />
            </section>
          ) : null}

          {/* Üretilen Videolar Galerisi */}
          <VideoGrid
            videos={videos}
            onPreview={v => {
              setSelectedId(v.id);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onReProduce={v => produceVideo({ ...v })}
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
    </div>
  );
}
