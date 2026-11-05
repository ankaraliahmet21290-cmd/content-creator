'use client';

import { useState, useEffect } from 'react';
import { Scene, VideoItem } from '@/types';
import { RATIOS } from '@/lib/constants';
import { audioMgr } from '@/lib/audio';
import { exportVideoFile, downloadVideoJson } from '@/lib/exportVideo';
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

  const scenes = video.scenes;
  const curScene = scenes[curIndex] || scenes[0];
  const [aspectW, aspectH] = RATIOS[video.ratio] || [16, 9];
  const isCinema = video.type === 'sinema' || video.ratio === '21:9';
  const isDocumentary = video.type === 'belgesel';
  const isYouTube = video.type === 'youtube';
  const isAi = video.mode !== 'classic';

  useEffect(() => {
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
      audioMgr.speak(
        curScene.vo,
        video.lang || 'tr-TR',
        curScene.audioUrl,
        video.voiceGender || 'female'
      );
    }
  }, [curIndex, isPlaying, isTTSActive, curScene, video.lang, video.voiceGender, video.id, isCinema]);

  useEffect(() => {
    if (isBGMActive && isPlaying) {
      audioMgr.startBGM(video.type);
    } else {
      audioMgr.stopBGM();
    }
    return () => audioMgr.stopBGM();
  }, [isBGMActive, isPlaying, video.type]);

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
          {/* SİNEMATİK / YOUTUBE v5 EKRANI */}
          <div
            className={`screen-box v5-screen ${isCinema ? 'cinema-letterbox' : ''} ${isYouTube ? 'youtube-screen' : ''}`}
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
            <div className={`v5-gradient-overlay ${isCinema ? 'cinema-overlay' : ''}`} />

            {/* 3. Üst Rozet */}
            <div className="v5-top-badge">
              <span className={`v5-brand-title ${isCinema ? 'cinema-badge' : isYouTube ? 'youtube-badge' : ''}`}>
                {isCinema ? '🎬 ' : isYouTube ? '🔴 ' : ''}
                {video.product.toUpperCase()}
              </span>
              <span className="v5-scene-tag">
                {curScene?.role} · {curIndex + 1}/{scenes.length}
              </span>
            </div>

            {/* 4. Alt Tipografi Grubu (Başlık, Alt Başlık, Vurgu) */}
            <div className="v5-content-group">
              <div className={`v5-main-title ${isCinema ? 'cinema-title' : ''}`} key={`title-${curIndex}`}>
                {curScene?.text}
              </div>
              {curScene?.subtitle && (
                <div className="v5-sub-title" key={`sub-${curIndex}`}>
                  {curScene.subtitle}
                </div>
              )}
              {curScene?.highlight && (
                <div className={`v5-highlight-badge ${isCinema ? 'cinema-hl' : isYouTube ? 'youtube-hl' : ''}`} key={`hl-${curIndex}`}>
                  {isCinema ? '✦ ' : isYouTube ? '▶ ' : '★ '}
                  {curScene.highlight}
                </div>
              )}
              <div className="v5-vo-line">
                🎙️ {curScene?.vo}
              </div>
            </div>

            {/* İlerleme Çubuğu */}
            <div className="pb-track">
              <div
                className={`pb-fill ${isYouTube ? 'youtube-pb' : isCinema ? 'cinema-pb' : ''}`}
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
              {isPlaying ? '⏸ Duraklat' : '▶ Reklamı Oynat'}
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
              {isBGMActive ? '🎵 Satış Müziği Açık' : '🎵 Müzik Kapalı'}
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
              {isExporting ? '⏳ 1080p Sinematik Render Ediliyor...' : '📥 v5 Sinematik Video İndir (.webm)'}
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => downloadVideoJson(video)}
            >
              📄 Senaryo İndir (.json)
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
