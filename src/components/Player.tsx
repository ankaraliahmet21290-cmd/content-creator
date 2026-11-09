'use client';

import { useState, useEffect } from 'react';
import { Scene, VideoItem } from '@/types';
import { RATIOS, BG_MUSIC_OPTIONS } from '@/lib/constants';
import { audioMgr } from '@/lib/audio';
import { exportVideoFile, downloadVideoJson, exportFilmPoster, downloadDistributionPackage } from '@/lib/exportVideo';
import { SceneTimeline } from './SceneTimeline';
import { SceneEditModal } from './SceneEditModal';

interface PlayerProps {
  video: VideoItem;
  onUpdateScene: (videoId: string, updated: Scene) => void;
}

export function Player({ video, onUpdateScene }: PlayerProps) {
  const [curIndex, setCurIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(true);
  const [isBGMActive, setIsBGMActive] = useState(true);
  const [currentBgm, setCurrentBgm] = useState<string>(video.bgMusic || 'auto');
  const [customMusicData, setCustomMusicData] = useState<string | undefined>(video.customMusicData);
  const [customMusicName, setCustomMusicName] = useState<string | undefined>(video.customMusicName);
  const [editScene, setEditScene] = useState<Scene | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPosterLoading, setIsPosterLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ percent: number; statusText: string } | null>(null);

  const scenes = video.scenes;
  const curScene = scenes[curIndex] || scenes[0];
  const [aspectW, aspectH] = RATIOS[video.ratio] || [16, 9];
  const isCinema = video.type === 'sinema' || video.ratio === '21:9';
  const isDocumentary = video.type === 'belgesel';
  const isYouTube = video.type === 'youtube';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurIndex(0);
    setProgress(0);
    setIsPlaying(false);
    setCurrentBgm(video.bgMusic || 'auto');
    setCustomMusicData(video.customMusicData);
    setCustomMusicName(video.customMusicName);
    audioMgr.stopSpeech();
    audioMgr.stopBGM();
  }, [video.id, video.bgMusic, video.customMusicData, video.customMusicName]);

  useEffect(() => {
    if (isPlaying && isTTSActive && curScene) {
      const sceneVoice =
        curScene.voiceGender ||
        (video.voiceGender || 'male');

      audioMgr.speak(
        curScene.vo,
        video.lang || 'tr-TR',
        curScene.audioUrl,
        sceneVoice
      );
    }
  }, [curIndex, isPlaying, isTTSActive, curScene, video.lang, video.voiceGender, video.id]);

  useEffect(() => {
    if (isBGMActive && isPlaying) {
      audioMgr.startBGM(video.type, currentBgm, video.product, customMusicData);
    } else {
      audioMgr.stopBGM();
    }
    return () => audioMgr.stopBGM();
  }, [isBGMActive, isPlaying, video.type, currentBgm, video.product, customMusicData]);

  useEffect(() => {
    if (!isPlaying || !curScene) return;
    const intervalMs = 60;
    const step = 100 / (curScene.sec * (1000 / intervalMs));

    const id = setInterval(() => {
      setProgress(p => {
        const next = p + step;
        if (next >= 100) {
          setCurIndex(i => (i + 1) % scenes.length);
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [isPlaying, curIndex, curScene, scenes.length, video.id]);

  async function handleExportVideo() {
    setIsExporting(true);
    setExportProgress({ percent: 1, statusText: 'Render motoru başlatılıyor...' });
    try {
      await exportVideoFile(
        { ...video, bgMusic: currentBgm, customMusicData, customMusicName },
        (percent, statusText) => {
          setExportProgress({ percent, statusText });
        }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Video render hatası: ' + msg);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }

  function handleSaveSceneEdit(updated: Scene) {
    onUpdateScene(video.id, updated);
    setEditScene(null);
  }

  const maxWidthPx = video.ratio === '21:9' ? 720 : aspectW > aspectH ? 640 : aspectW === aspectH ? 420 : 320;
  const isZoomIn = curScene?.zoomDir !== 'out';
  const zoomScale = isZoomIn ? 1.0 + (progress / 100) * 0.12 : 1.12 - (progress / 100) * 0.12;

  return (
    <div>
      <div className="stage-wrap">
        <div>
          {/* SİNEMATİK / BELGESEL / YOUTUBE v5 EKRANI */}
          <div
            className={`screen-box v5-screen ${isCinema ? 'cinema-letterbox' : ''} ${isDocumentary ? 'documentary-screen' : ''} ${isYouTube ? 'youtube-screen' : ''}`}
            style={{
              aspectRatio: `${aspectW} / ${aspectH}`,
              width: `min(${maxWidthPx}px, 100%)`
            }}
          >
            {/* 1. Arka Plan: Dudak Senkronlu Video veya Sinematik Fotoğraf (Ken Burns Canlı Zoom) */}
            {curScene?.lipSyncVideoUrl ? (
              <video
                key={`lipsync-${curIndex}`}
                src={curScene.lipSyncVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="v5-photo-layer"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scale(1)'
                }}
              />
            ) : (
              <>
                {curIndex > 0 && scenes[curIndex - 1]?.imageUrl && (
                  <div
                    key={`prev-bg-${curIndex}`}
                    className="v5-photo-layer"
                    style={{
                      backgroundImage: `url("${scenes[curIndex - 1].imageUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: 0.75
                    }}
                  />
                )}
                <div
                  key={`cur-bg-${curIndex}`}
                  className="v5-photo-layer v5-photo-fade-in"
                  style={{
                    backgroundImage: curScene?.imageUrl
                      ? `url("${curScene.imageUrl}")`
                      : `linear-gradient(135deg, ${curScene?.grad?.[0] || '#0a1020'}, ${curScene?.grad?.[1] || '#000000'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `scale(${zoomScale})`
                  }}
                />
              </>
            )}

            {/* 2. Sinematik Koyu Alt Kuşak (Dark / Gradient Overlay) */}
            <div className={`v5-gradient-overlay ${isCinema || isDocumentary ? 'cinema-overlay' : ''}`} />

            {/* 3. Üst Rozet */}
            <div className="v5-top-badge">
              <span className={`v5-brand-title ${isCinema ? 'cinema-badge' : isDocumentary ? 'documentary-badge' : isYouTube ? 'youtube-badge' : ''}`}>
                {isCinema ? '🎬 ' : isDocumentary ? '🎙️ ' : isYouTube ? '🔴 ' : (video.type === 'reklam' ? '📢 ' : '🏢 ')}
                {(video.product || 'VİDEO PROJESİ')
                  .replace(/_reklam.*$/i, '')
                  .replace(/\s*\(\d+\)/g, '')
                  .replace(/_/g, ' ')
                  .trim()
                  .toUpperCase()}
              </span>
              <span className="v5-scene-tag">
                {curScene?.role} · {curIndex + 1}/{scenes.length}
                {curScene?.speaker && (
                  <span style={{ marginLeft: 6, color: '#a78bfa', fontWeight: 600 }}>
                    🎭 {curScene.speaker} ({curScene.voiceGender === 'female' ? 'Kadın' : 'Erkek'})
                  </span>
                )}
                {curScene?.audioUrl && (
                  <span style={{ marginLeft: 6, color: '#38bdf8', fontWeight: 600 }} title="Gerçek Gemini 24kHz Stüdyo Seslendirmesi">
                    🎙️ AI Ses
                  </span>
                )}
                {curScene?.lipSyncVideoUrl && (
                  <span style={{ marginLeft: 6, color: '#f43f5e', fontWeight: 600 }} title="Dudak Senkronizasyonu Aktif">
                    👄 Dudak Senkronu
                  </span>
                )}
                {curScene?.imageUrl?.includes('ai_scene_') && (
                  <span style={{ marginLeft: 6, color: '#fde047', fontWeight: 600 }} title="Flux AI Fotogerçekçi Film Sahnesi">
                    🎬 AI Sahne
                  </span>
                )}
              </span>
            </div>

            {/* 4. Alt Tipografi Grubu (Başlık, Alt Başlık, Vurgu) */}
            <div key={`content-group-${curIndex}`} className="v5-content-group v5-text-fade">
              <div className={`v5-main-title ${isCinema || isDocumentary ? 'cinema-title' : ''}`} key={`title-${curIndex}`}>
                {curScene?.text}
              </div>
              {curScene?.subtitle && (
                <div className={`v5-sub-title ${isDocumentary ? 'documentary-sub' : ''}`} key={`sub-${curIndex}`}>
                  {curScene.subtitle}
                </div>
              )}
              {curScene?.highlight && (
                <div className={`v5-highlight-badge ${isCinema ? 'cinema-hl' : isDocumentary ? 'documentary-hl' : isYouTube ? 'youtube-hl' : ''}`} key={`hl-${curIndex}`}>
                  {isCinema ? '✦ ' : isDocumentary ? '🔍 ' : isYouTube ? '▶ ' : '★ '}
                  {curScene.highlight}
                </div>
              )}
              <div className="v5-vo-line">
                🎙️ {curScene?.speaker ? <strong style={{ color: '#fde047' }}>[{curScene.speaker}]: </strong> : null}
                {curScene?.vo}
              </div>
            </div>

            {/* İlerleme Çubuğu */}
            <div className="pb-track">
              <div
                className={`pb-fill ${isYouTube ? 'youtube-pb' : isCinema ? 'cinema-pb' : isDocumentary ? 'documentary-pb' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Oynatıcı Kontrolleri */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
            <button
              type="button"
              className="btn primary sm"
              onClick={() => {
                const nextState = !isPlaying;
                setIsPlaying(nextState);
                if (!nextState) audioMgr.stopSpeech();
              }}
            >
              {isPlaying
                ? '⏸ Duraklat'
                : isCinema
                ? '▶ Filmi / Fragmanı Oynat'
                : isDocumentary
                ? '▶ Belgeseli Oynat'
                : '▶ Videoyu Oynat'}
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => {
                setCurIndex(0);
                setProgress(0);
              }}
            >
              ⏮ Başa Sar
            </button>
            <button
              type="button"
              className={`btn sm ${isTTSActive ? 'primary' : ''}`}
              onClick={() => {
                const nextTTS = !isTTSActive;
                setIsTTSActive(nextTTS);
                if (!nextTTS) audioMgr.stopSpeech();
              }}
            >
              {isTTSActive ? '🔊 AI Ses Açık' : '🔇 AI Ses Kapalı'}
            </button>
            <button
              type="button"
              className={`btn sm ${isBGMActive ? 'primary' : ''}`}
              onClick={() => setIsBGMActive(!isBGMActive)}
            >
              {isBGMActive ? '🎵 Müzik Açık' : '🔇 Müzik Kapalı'}
            </button>

            {/* Anlık Müzik Değiştirici */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>Fon Müziği:</span>
              <select
                value={currentBgm}
                onChange={e => {
                  const newTrack = e.target.value;
                  setCurrentBgm(newTrack);
                  if (isPlaying && isBGMActive) {
                    audioMgr.startBGM(video.type, newTrack, video.product, customMusicData);
                  }
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: 'var(--card-bg, #1a2234)',
                  color: 'var(--txt, #ffffff)',
                  border: '1px solid var(--line, rgba(255,255,255,0.15))',
                  cursor: 'pointer'
                }}
              >
                {BG_MUSIC_OPTIONS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id === 'custom' && customMusicName ? `📁 Özel: ${customMusicName}` : m.label}
                  </option>
                ))}
              </select>

              {/* Kendi Müziğini Yükle Butonu */}
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  background: currentBgm === 'custom' && customMusicData ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                  border: currentBgm === 'custom' && customMusicData ? '1px solid #10b981' : '1px solid rgba(56, 189, 248, 0.3)',
                  color: currentBgm === 'custom' && customMusicData ? '#10b981' : '#38bdf8',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                title="Kendi MP3/WAV/M4A ses dosyanızı yükleyin"
              >
                📁 {customMusicName ? 'Müziği Değiştir' : 'Özel Müzik Yükle'}
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = reader.result as string;
                        setCustomMusicData(dataUrl);
                        setCustomMusicName(file.name);
                        setCurrentBgm('custom');
                        if (isPlaying && isBGMActive) {
                          audioMgr.startBGM(video.type, 'custom', video.product, dataUrl);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Canlı Render İlerleme Çubuğu */}
          {exportProgress && (
            <div
              style={{
                marginTop: 12,
                marginBottom: 8,
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: '#38bdf8' }}>⏳ 1080p MP4 Video Oluşturuluyor (Canlı Miksaj)...</span>
                <span style={{ color: '#facc15' }}>%{exportProgress.percent}</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${exportProgress.percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8 0%, #3b82f6 50%, #10b981 100%)',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8' }}>
                {exportProgress.statusText}
              </div>
            </div>
          )}

          {/* Dışa Aktarma Butonları */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <button
              type="button"
              className="btn sm primary"
              disabled={isExporting}
              onClick={handleExportVideo}
            >
              {isExporting
                ? `⏳ Render Ediliyor: %${exportProgress?.percent || 0}`
                : isCinema
                ? '🎬 Sinema Filmi İndir (1080p MP4)'
                : isDocumentary
                ? '🎙️ Sinematik Belgesel İndir (1080p MP4)'
                : '🎬 1080p MP4 Olarak İndir'}
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => downloadVideoJson(video)}
            >
              📄 Senaryo İndir (.json)
            </button>
            <button
              type="button"
              className="btn sm"
              disabled={isPosterLoading}
              onClick={async () => {
                setIsPosterLoading(true);
                try {
                  await exportFilmPoster(video);
                } finally {
                  setIsPosterLoading(false);
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600
              }}
              title="23. Adım: 1200x1800 Sinema Afişi (Poster) Oluştur ve İndir"
            >
              {isPosterLoading ? '⏳ Afiş Hazırlanıyor...' : '🖼️ 23. Adım: Film Afişi İndir'}
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => downloadDistributionPackage(video)}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                fontWeight: 600
              }}
              title="24. Adım: YouTube, Sosyal Medya ve Festival Dağıtım Paketini İndir"
            >
              📢 24. Adım: Dağıtım Paketi
            </button>
          </div>
        </div>

        {/* Sağ Sütun: Sahne Zaman Çizelgesi */}
        <div>
          <SceneTimeline
            scenes={scenes}
            currentIndex={curIndex}
            totalDuration={video.dur}
            onSelectScene={idx => {
              setCurIndex(idx);
              setProgress(0);
            }}
            onEditScene={s => setEditScene({ ...s })}
          />
        </div>
      </div>

      {editScene && (
        <SceneEditModal
          scene={editScene}
          onClose={() => setEditScene(null)}
          onSave={handleSaveSceneEdit}
        />
      )}
    </div>
  );
}
