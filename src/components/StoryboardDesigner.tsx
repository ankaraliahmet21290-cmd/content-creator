'use client';

import { useState, useMemo } from 'react';
import { Scene, VideoItem } from '@/types';
import { CINEMA_ROLES, YOUTUBE_ROLES, SOP_ROLES } from '@/lib/constants';
import { VisualPickerModal } from './VisualPickerModal';
import { getScenePhoto } from '@/lib/assets';

interface StoryboardDesignerProps {
  video: VideoItem;
  onUpdateScenes: (scenes: Scene[]) => void;
  onConfirmAndRender: (scenes: Scene[]) => void;
  onCancel: () => void;
  isRendering?: boolean;
}

export function StoryboardDesigner({
  video,
  onUpdateScenes,
  onConfirmAndRender,
  onCancel,
  isRendering = false
}: StoryboardDesignerProps) {
  const [scenes, setScenes] = useState<Scene[]>(video.scenes || []);
  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(null);
  const [generatingSceneId, setGeneratingSceneId] = useState<number | null>(null);

  const generateAiImageForScene = async (index: number) => {
    const sc = scenes[index];
    if (!sc) return;
    setGeneratingSceneId(sc.id);
    try {
      const res = await fetch('/api/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sc.visual || `${video.product} ${sc.role} ${sc.text}`,
          ratio: video.ratio || '21:9',
          role: sc.role,
          type: video.type
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        updateScene(index, { imageUrl: data.imageUrl });
      }
    } catch {
      // ignore
    } finally {
      setGeneratingSceneId(null);
    }
  };

  const isCinema = video.type === 'sinema' || video.ratio === '21:9';
  const isYouTube = video.type === 'youtube';

  const roleOptions = useMemo(() => {
    if (isCinema) return CINEMA_ROLES;
    if (isYouTube) return YOUTUBE_ROLES;
    return SOP_ROLES;
  }, [isCinema, isYouTube]);

  const totalDuration = useMemo(() => {
    return scenes.reduce((acc, s) => acc + (Number(s.sec) || 0), 0);
  }, [scenes]);

  const updateScene = (index: number, patch: Partial<Scene>) => {
    const updated = scenes.map((s, idx) => (idx === index ? { ...s, ...patch } : s));
    setScenes(updated);
    onUpdateScenes(updated);
  };

  const moveScene = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= scenes.length) return;
    const clone = [...scenes];
    const [moved] = clone.splice(index, 1);
    clone.splice(targetIndex, 0, moved);
    // ID'leri yeniden sırala
    const reindexed = clone.map((s, idx) => ({ ...s, id: idx + 1 }));
    setScenes(reindexed);
    onUpdateScenes(reindexed);
  };

  const deleteScene = (index: number) => {
    if (scenes.length <= 2) {
      alert('Videonun en az 2 sahneden oluşması gerekir.');
      return;
    }
    const filtered = scenes.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, id: idx + 1 }));
    setScenes(filtered);
    onUpdateScenes(filtered);
  };

  const addScene = () => {
    const newId = scenes.length + 1;
    const defaultRole = roleOptions[Math.min(roleOptions.length - 1, scenes.length)] || 'Detay';
    const visualDesc = `Yeni sahne: ${video.product}`;
    const newScene: Scene = {
      id: newId,
      role: defaultRole,
      sec: 5.0,
      text: `${video.product}: Sahne ${newId}`,
      subtitle: 'Sinematik Anlatı',
      highlight: '',
      vo: `Bu sahnede ${video.product} ile ilgili çarpıcı bir detay yer alıyor.`,
      visual: visualDesc,
      grad: ['#1e1b4b', '#7c3aed'],
      imageUrl: getScenePhoto(video.type, defaultRole, visualDesc, newId - 1, video.product)
    };
    const updated = [...scenes, newScene];
    setScenes(updated);
    onUpdateScenes(updated);
  };

  const autoReassignImages = () => {
    const updated = scenes.map((s, idx) => ({
      ...s,
      imageUrl: getScenePhoto(video.type, s.role, s.visual, idx, video.product)
    }));
    setScenes(updated);
    onUpdateScenes(updated);
  };

  return (
    <section className="panel storyboard-panel" style={{ marginBottom: 24, border: '2px solid var(--acc)' }}>
      {/* Üst Bar: Başlık ve Hızlı Eylemler */}
      <div
        className="panel-hdr"
        style={{
          borderBottom: '1px solid var(--line)',
          paddingBottom: 16,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              className={`badge-mode ${
                video.mode === 'sinema'
                  ? 'cinema'
                  : video.mode === 'youtube'
                  ? 'youtube'
                  : video.mode === 'classic'
                  ? 'classic'
                  : 'ai'
              }`}
            >
              {isCinema ? '🎬 Sinema Storyboard' : isYouTube ? '🔴 YouTube Storyboard' : '✨ Sahne Tasarımcısı'}
            </span>
            <span className="badge" style={{ background: 'var(--acc-glow)', color: 'var(--acc-light)' }}>
              {scenes.length} Sahne · Toplam {totalDuration.toFixed(1)} sn (Hedef: {video.dur} sn)
            </span>
          </div>
          <h2 style={{ fontSize: 20, margin: 0 }}>
            {video.product} – Sahne Tasarım & Storyboard Masası
          </h2>
          <div style={{ fontSize: 13, color: 'var(--mute)', marginTop: 4 }}>
            Yapay zekanın tasarladığı sahneleri inceleyin. Görselleri değiştirebilir, replikleri düzenleyebilir ve sırayı ayarlayabilirsiniz.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn sm"
            onClick={addScene}
            disabled={isRendering}
            title="Yeni bir sahne ekle"
          >
            ➕ Yeni Sahne Ekle
          </button>
          <button
            type="button"
            className="btn sm"
            onClick={autoReassignImages}
            disabled={isRendering}
            title="Tüm kareleri role göre otomatik yeniden eşle"
          >
            🎲 Kareleri Yeniden Eşle
          </button>
          <button
            type="button"
            className="btn sm"
            onClick={onCancel}
            disabled={isRendering}
          >
            ✕ İptal Et
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => onConfirmAndRender(scenes)}
            disabled={isRendering || scenes.length === 0}
            style={{
              fontWeight: 700,
              padding: '8px 20px',
              boxShadow: '0 4px 16px var(--acc-glow)'
            }}
          >
            {isRendering ? '⏳ Render Ediliyor...' : '🎬 Tasarımı Onayla & Videoyu Render Et 🚀'}
          </button>
        </div>
      </div>

      {/* Storyboard Sahne Kartları Grid / Akışı */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16
        }}
      >
        {scenes.map((scene, idx) => (
          <div
            key={scene.id || idx}
            style={{
              background: 'var(--card-sub)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {/* Kart Üst Bilgisi */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--acc)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  {idx + 1}
                </span>
                <select
                  value={scene.role}
                  onChange={e => updateScene(idx, { role: e.target.value })}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    background: 'var(--card)'
                  }}
                >
                  {roleOptions.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taşıma ve Silme Butonları */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  className="btn sm"
                  style={{ padding: '2px 8px' }}
                  onClick={() => moveScene(idx, 'left')}
                  disabled={idx === 0}
                  title="Sola / Öne Taşı"
                >
                  ◀
                </button>
                <button
                  type="button"
                  className="btn sm"
                  style={{ padding: '2px 8px' }}
                  onClick={() => moveScene(idx, 'right')}
                  disabled={idx === scenes.length - 1}
                  title="Sağa / Arkaya Taşı"
                >
                  ▶
                </button>
                <button
                  type="button"
                  className="btn sm danger"
                  style={{ padding: '2px 8px' }}
                  onClick={() => deleteScene(idx)}
                  title="Bu Sahneyi Sil"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Görsel Önizleme ve Eylemler */}
            <div
              style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                aspectRatio: isCinema ? '21 / 9' : '16 / 9',
                backgroundImage: scene.imageUrl
                  ? `url("${scene.imageUrl}")`
                  : `linear-gradient(135deg, ${scene.grad[0]}, ${scene.grad[1]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: 8
              }}
            >
              <button
                type="button"
                className="btn sm"
                onClick={() => generateAiImageForScene(idx)}
                disabled={generatingSceneId === scene.id}
                style={{
                  fontSize: 11,
                  padding: '4px 9px',
                  background: 'rgba(99, 102, 241, 0.9)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(4px)',
                  fontWeight: 600
                }}
                title="Yapay zekâ ile bu sahne için sıfırdan benzersiz görsel üret"
              >
                {generatingSceneId === scene.id ? '⏳ Çiziliyor...' : '✨ AI ile Çiz'}
              </button>

              <button
                type="button"
                className="btn sm primary"
                onClick={() => setActivePickerIndex(idx)}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                🖼️ Galeriden Seç
              </button>
            </div>

            {/* Ekran Metni (Başlık) */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--mute)', display: 'block', marginBottom: 3 }}>
                EKRAN METNİ / ALTYAZI
              </label>
              <input
                type="text"
                value={scene.text}
                onChange={e => updateScene(idx, { text: e.target.value })}
                placeholder="Ekranda görünecek çarpıcı başlık veya replik"
                style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 6 }}
              />
            </div>

            {/* Seslendirme Metni (VO) */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--mute)', display: 'block', marginBottom: 3 }}>
                🎙️ SESLENDİRME METNİ (VOICEOVER)
              </label>
              <textarea
                value={scene.vo}
                rows={2}
                onChange={e => updateScene(idx, { vo: e.target.value })}
                placeholder="Yapay zekanın okuyacağı anlatıcı veya karakter repliği"
                style={{ width: '100%', fontSize: 12, padding: '6px 10px', borderRadius: 6, resize: 'vertical' }}
              />
            </div>

            {/* Süre & Vurgu */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8, alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--mute)', display: 'block', marginBottom: 3 }}>
                  SÜRE (SN)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="30"
                  value={scene.sec}
                  onChange={e => updateScene(idx, { sec: Math.max(1, Number(e.target.value)) })}
                  style={{ width: '100%', fontSize: 13, padding: '6px 8px', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--mute)', display: 'block', marginBottom: 3 }}>
                  VURGU ETİKETİ (OPSİYONEL)
                </label>
                <input
                  type="text"
                  value={scene.highlight || ''}
                  onChange={e => updateScene(idx, { highlight: e.target.value })}
                  placeholder="örn: IMAX, Çok Yakında"
                  style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 6 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Görsel Seçici Modalı */}
      {activePickerIndex !== null && scenes[activePickerIndex] && (
        <VisualPickerModal
          currentUrl={scenes[activePickerIndex].imageUrl}
          sceneRole={scenes[activePickerIndex].role}
          visualPrompt={scenes[activePickerIndex].visual || scenes[activePickerIndex].text}
          ratio={video.ratio}
          briefType={video.type}
          onSelect={newUrl => {
            updateScene(activePickerIndex, { imageUrl: newUrl });
          }}
          onClose={() => setActivePickerIndex(null)}
        />
      )}
    </section>
  );
}

