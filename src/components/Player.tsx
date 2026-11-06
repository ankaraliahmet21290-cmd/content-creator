'use client';

import { useState, useEffect } from 'react';
import { Scene, VideoItem } from '@/types';
import { RATIOS } from '@/lib/constants';
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
  const [editScene, setEditScene] = useState<Scene | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPosterLoading, setIsPosterLoading] = useState(false);

  const scenes = video.scenes;
  const curScene = scenes[curIndex] || scenes[0];
  const [aspectW, aspectH] = RATIOS[video.ratio] || [16, 9];
  const isCinema = video.type === 'sinema' || video.ratio === '21:9';
  const isDocumentary = video.type === 'belgesel';
  const isYouTube = video.type === 'youtube';
  const isAi = video.mode !== 'classic';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurIndex(0);
    setProgress(0);
    setIsPlaying(false);
    audioMgr.stopSpeech();
    audioMgr.stopBGM();
  }, [video.id]);

  useEffect(() => {
    if (isPlaying && isTTSActive && curScene) {
      if (isCinema && curIndex > 0) {
        audioMgr.playTransitionSFX();
      }
      const sceneVoice =
        curScene.voiceGender ||
        (isCinema ? (curIndex % 2 === 1 ? 'female' : 'male') : (video.voiceGender || 'female'));

      audioMgr.speak(
        curScene.vo,
        video.lang || 'tr-TR',
        curScene.audioUrl,
        sceneVoice
      );
    }
  }, [curIndex, isPlaying, isTTSActive, curScene, video.lang, video.voiceGender, video.id, isCinema]);

  useEffect(() => {
    if (isBGMActive && isPlaying) {
      audioMgr.startBGM(video.type, video.bgMusic);
    } else {
      audioMgr.stopBGM();
    }
    return () => audioMgr.stopBGM();
  }, [isBGMActive, isPlaying, video.type, video.bgMusic]);

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
    try {
      await exportVideoFile(video);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Video render hatası: ' + msg);
    } finally {
      setIsExporting(false);
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
            {/* 1. Arka Plan Sinematik Fotoğrafı (Ken Burns Canlı Zoom) */}
            <div
              className="v5-photo-layer"
              style={{
                backgroundImage: curScene?.imageUrl
                  ? `url("${curScene.imageUrl}")`
                  : `linear-gradient(135deg, ${curScene?.grad?.[0] || '#0a1020'}, ${curScene?.grad?.[1] || '#000000'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${zoomScale})`
              }}
            />

            {/* 2. Sinematik Koyu Alt Kuşak (Dark / Gradient Overlay) */}
            <div className={`v5-gradient-overlay ${isCinema || isDocumentary ? 'cinema-overlay' : ''}`} />

            {/* 3. Üst Rozet */}
            <div className="v5-top-badge">
              <span className={`v5-brand-title ${isCinema ? 'cinema-badge' : isDocumentary ? 'documentary-badge' : isYouTube ? 'youtube-badge' : ''}`}>
                {isCinema ? '🎬 ' : isDocumentary ? '🎙️ ' : isYouTube ? '🔴 ' : ''}
                {video.product.toUpperCase()}
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
                {curScene?.imageUrl?.includes('ai_scene_') && (
                  <span style={{ marginLeft: 6, color: '#fde047', fontWeight: 600 }} title="Flux AI Fotogerçekçi Film Sahnesi">
                    🎬 AI Sahne
                  </span>
                )}
              </span>
            </div>

            {/* 4. Alt Tipografi Grubu (Başlık, Alt Başlık, Vurgu) */}
            <div className="v5-content-group">
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
              {isBGMActive
                ? isCinema || isDocumentary
                  ? '🎵 Sinematik Müzik Açık'
                  : '🎵 Satış Müziği Açık'
                : '🎵 Müzik Kapalı'}
            </button>
          </div>

          {/* Dışa Aktarma Butonları */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <button
              type="button"
              className="btn sm primary"
              disabled={isExporting}
              onClick={handleExportVideo}
            >
              {isExporting
                ? '⏳ 1080p Sinematik Render Ediliyor...'
                : isCinema
                ? '📥 Sinema Filmi İndir (.webm)'
                : isDocumentary
                ? '📥 Sinematik Belgesel İndir (.webm)'
                : '📥 Video İndir (.webm)'}
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
