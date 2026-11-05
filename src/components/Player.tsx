'use client';

import { useState, useEffect } from 'react';
import { Scene, VideoItem } from '@/types';
import { RATIOS } from '@/lib/constants';
import { audioMgr } from '@/lib/audio';
import { evaluateQC } from '@/lib/qc';
import { exportVideoFile, downloadVideoJson } from '@/lib/exportVideo';
import { SceneTimeline } from './SceneTimeline';
import { QCChecklist } from './QCChecklist';
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
  const [isBGMActive, setIsBGMActive] = useState(false);
  const [editScene, setEditScene] = useState<Scene | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const scenes = video.scenes;
  const curScene = scenes[curIndex] || scenes[0];
  const [aspectW, aspectH] = RATIOS[video.ratio] || [9, 16];

  // Video ID değiştiğinde sıfırla ve duraklatılmış (otomatik başlamaz) halde tut
  useEffect(() => {
    setCurIndex(0);
    setProgress(0);
    setIsPlaying(false);
    audioMgr.stopSpeech();
    audioMgr.stopBGM();
  }, [video.id]);

  // Sahne değiştiğinde TTS seslendir (Gemini AI WAV veya Web Speech)
  useEffect(() => {
    if (isPlaying && isTTSActive && curScene) {
      audioMgr.speak(curScene.vo, video.lang || 'tr-TR', curScene.audioUrl);
    }
  }, [curIndex, isPlaying, isTTSActive, curScene, video.lang, video.id]);

  // BGM Aç / Kapat
  useEffect(() => {
    if (isBGMActive && isPlaying) {
      audioMgr.startBGM();
    } else {
      audioMgr.stopBGM();
    }
    return () => audioMgr.stopBGM();
  }, [isBGMActive, isPlaying]);

  // Oynatma Döngüsü
  useEffect(() => {
    if (!isPlaying || !curScene) return;
    const intervalMs = 80;
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

  const qc = evaluateQC(video);
  const maxWidthPx = aspectW > aspectH ? 520 : aspectW === aspectH ? 360 : 270;
  const screenStyle: React.CSSProperties = {
    aspectRatio: `${aspectW} / ${aspectH}`,
    width: `min(${maxWidthPx}px, 100%)`,
    background: curScene?.imageUrl
      ? `url("${curScene.imageUrl}") center / cover no-repeat, linear-gradient(145deg, ${curScene.grad[0]}, ${curScene.grad[1]})`
      : curScene
      ? `linear-gradient(145deg, ${curScene.grad[0]}, ${curScene.grad[1]})`
      : '#1e1b4b'
  };

  return (
    <div>
      <div className="stage-wrap">
        {/* Sol Sütun: Ekran Önizleme & Oynatıcı Kontrolleri */}
        <div>
          <div className="screen-box" style={screenStyle}>
            <div className="top-bar">
              <span className="tag">
                {curScene?.role} · {curIndex + 1}/{scenes.length}
                {curScene?.audioUrl ? ' · ✨ Gemini AI' : ''}
              </span>
              <span className="brand-mark">{video.product}</span>
            </div>

            <div className="center-content">
              <div className="cap" key={`${video.id}-${curIndex}`}>
                {curScene?.text}
              </div>
              <div className="vo-sub">
                🎙️ {curScene?.vo}
              </div>
            </div>

            <div className="pb-track">
              <div className="pb-fill" style={{ width: `${progress}%` }} />
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
              {isPlaying ? '⏸ Duraklat' : '▶ Oynat'}
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
              {isTTSActive ? '🔊 TTS Açık' : '🔇 TTS Kapalı'}
            </button>
            <button
              type="button"
              className={`btn sm ${isBGMActive ? 'primary' : ''}`}
              onClick={() => setIsBGMActive(!isBGMActive)}
            >
              {isBGMActive ? '🎵 Müzik Açık' : '🎵 Müzik Kapalı'}
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
              {isExporting ? '⏳ Render Ediliyor...' : '📥 Video İndir (.webm)'}
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

        {/* Sağ Sütun: Sahne Zaman Çizelgesi & Kalite Kontrolü */}
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

          <QCChecklist qc={qc} />
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
