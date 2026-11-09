'use client';

import { useState, useMemo } from 'react';
import { Scene, VideoItem } from '@/types';
import { CINEMA_ROLES, DOCUMENTARY_ROLES, YOUTUBE_ROLES, SOP_ROLES, SHORTS_ROLES, SPORTS_ROLES } from '@/lib/constants';
import { VisualPickerModal } from './VisualPickerModal';
import { getScenePhoto } from '@/lib/assets';
import { generateLipSyncForScene } from '@/lib/lipSync';

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
  const [lipSyncingSceneId, setLipSyncingSceneId] = useState<number | null>(null);
  const [lipSyncProgressText, setLipSyncProgressText] = useState<string>('');

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
          type: video.type,
          characterPrompt: video.character?.enabled ? video.character.consistencyPrompt : undefined
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

  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string>('');

  const generateAllAiImages = async () => {
    setIsBatchGenerating(true);
    setBatchProgress('Başlatılıyor...');
    try {
      for (let i = 0; i < scenes.length; i++) {
        setBatchProgress(`Sahne ${i + 1} / ${scenes.length} AI ile çiziliyor...`);
        await generateAiImageForScene(i);
      }
    } finally {
      setIsBatchGenerating(false);
      setBatchProgress('');
    }
  };

  const fetchWebImageForScene = async (index: number) => {
    const sc = scenes[index];
    if (!sc) return;
    setGeneratingSceneId(sc.id);
    try {
      const q = (sc.visual || `${video.product} ${sc.role}`)
        .replace(/award-winning|cinematic|35mm film still|shot on|arri alexa|panavision|anamorphic primes|dramatic cinematic lighting|color graded in davinci resolve|8k resolution|photorealistic|hyperdetailed|volumetric rim lighting|subtle film grain|movie scene|hasselblad|national geographic|bbc earth/gi, ' ')
        .replace(/[,\.:\"\'\(\)\[\]\{\}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = q.split(' ').filter(w => w.length > 2);
      const query = words.slice(0, 3).join(' ') || video.product;

      const res = await fetch(`/api/web-image?q=${encodeURIComponent(query)}&limit=6`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[index % data.results.length];
        if (item?.url) {
          updateScene(index, { imageUrl: item.url });
        }
      }
    } catch {
      // ignore
    } finally {
      setGeneratingSceneId(null);
    }
  };

  const fetchAllWebImages = async () => {
    setIsBatchGenerating(true);
    setBatchProgress('İnternet araması başlatılıyor...');
    try {
      for (let i = 0; i < scenes.length; i++) {
        setBatchProgress(`Sahne ${i + 1} / ${scenes.length} internetten bulunuyor...`);
        await fetchWebImageForScene(i);
      }
    } finally {
      setIsBatchGenerating(false);
      setBatchProgress('');
    }
  };

  const generateLipSync = async (index: number) => {
    const sc = scenes[index];
    if (!sc || !sc.imageUrl) {
      alert('Dudak senkronu oluşturmak için önce bir görsel (AI veya Web) atanmış olmalıdır.');
      return;
    }
    setLipSyncingSceneId(sc.id);
    setLipSyncProgressText('Ses ve ağız analizi yapılıyor...');
    try {
      const result = await generateLipSyncForScene({
        imageUrl: sc.imageUrl,
        audioUrl: sc.audioUrl,
        durationSec: sc.sec || 4,
        onProgress: (_pct, statusText) => {
          setLipSyncProgressText(statusText);
        }
      });
      if (result.videoUrl) {
        updateScene(index, {
          lipSyncVideoUrl: result.videoUrl,
          lipSyncStatus: 'ready'
        });
      }
    } catch (err) {
      console.error('Lip sync hatası:', err);
      alert('Dudak senkronu oluşturulamadı: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLipSyncingSceneId(null);
      setLipSyncProgressText('');
    }
  };

  const generateAllLipSync = async () => {
    setIsBatchGenerating(true);
    setBatchProgress('Dudak senkronizasyonu başlatılıyor...');
    try {
      for (let i = 0; i < scenes.length; i++) {
        if (scenes[i].imageUrl) {
          setBatchProgress(`Sahne ${i + 1}/${scenes.length} dudak senkronlanıyor...`);
          await generateLipSync(i);
        }
      }
    } finally {
      setIsBatchGenerating(false);
      setBatchProgress('');
    }
  };

  const isCinema = video.type === 'sinema' || video.ratio === '21:9';
  const isDocumentary = video.type === 'belgesel';
  const isYouTube = video.type === 'youtube';
  const isSocial = video.type === 'sosyal' || video.ratio === '9:16';
  const isRealEstate = /gayrimenkul|emlak|inşaat|rezidans|villa|konut|daire|arsa|korkmaz|broker|tapu/i.test(
    `${video.product} ${video.points || ''}`
  );
  const isSports = !isRealEstate && video.type !== 'reklam' && video.mode !== 'reklam' &&
    /\b(futbol|stadyum|şampiyonlar\s+ligi|süper\s+lig|taraftar|derbi|maç\s+özeti|galatasaray|fenerbahçe|beşiktaş|trabzonspor)\b/i.test(
      `${video.product} ${video.points || ''}`
    );

  const roleOptions = useMemo(() => {
    if (isSports) return SPORTS_ROLES;
    if (isSocial) return SHORTS_ROLES;
    if (isCinema) return CINEMA_ROLES;
    if (isDocumentary) return DOCUMENTARY_ROLES;
    if (isYouTube) return YOUTUBE_ROLES;
    return SOP_ROLES;
}, [isSports, isSocial, isCinema, isDocumentary, isYouTube]);

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
            className={`badge-mode ${video.mode === 'sinema'
                ? 'cinema'
                : video.mode === 'belgesel'
                  ? 'documentary'
                  : video.mode === 'youtube'
                    ? 'youtube'
                    : video.mode === 'classic'
                      ? 'classic'
                      : 'ai'
              }`}
          >
              {isSports
              ? '⚽ Maç Özeti & Goller'
              : video.mode === 'reklam' || video.type === 'reklam'
                ? '📢 Ticari Reklam Storyboard'
                : isSocial
                  ? '📱 Shorts & Reels (9:16)'
                  : isCinema
                    ? '🎬 Sinema Storyboard'
                    : isDocumentary
                      ? '🎙️ Belgesel Storyboard'
                      : isYouTube
                        ? '🔴 YouTube Storyboard'
                        : '✨ Sahne Tasarımcısı'}
          </span>
          <span className="badge" style={{ background: 'var(--acc-glow)', color: 'var(--acc-light)' }}>
            {scenes.length} Sahne · Toplam {totalDuration.toFixed(1)} sn (Hedef: {video.dur} sn)
          </span>
          {video.character?.enabled && (
            <span className="badge" style={{ background: 'rgba(217, 70, 239, 0.15)', color: '#d946ef', border: '1px solid rgba(217, 70, 239, 0.3)' }}>
              🎭 Karakter: {video.character.name} ({video.character.roleArchetype})
            </span>
          )}
          {video.bgMusic && video.bgMusic !== 'none' && (
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              🎵 {video.bgMusic === 'custom' ? `Özel Müzik: ${video.customMusicName || 'Yüklenen Parça'}` : video.bgMusic === 'cinema_epic' ? 'Epik Sinema' : video.bgMusic === 'youtube_lofi' ? 'Lo-Fi Beats' : video.bgMusic === 'auto' ? 'Otomatik Eşleme' : 'Fon Müziği'}
            </span>
          )}
        </div>
        <h2 style={{ fontSize: 20, margin: 0 }}>
          {video.product} – Sahne Tasarım & Storyboard Masası
        </h2>
        <div style={{ fontSize: 13, color: 'var(--mute)', marginTop: 4 }}>
          Yapay zekanın tasarladığı sahneleri inceleyin. Görselleri değiştirebilir, replikleri düzenleyebilir ve sırayı ayarlayabilirsiniz.
        </div>
      </div>

      <div className="storyboard-action-bar" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn sm"
          onClick={generateAllAiImages}
          disabled={isRendering || isBatchGenerating}
          title="Tüm sahnelerin kamera yönergelerinden yapay zekâ görseli üret"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#ffffff',
            fontWeight: 600,
            border: 'none',
            padding: '6px 12px'
          }}
        >
          {isBatchGenerating && batchProgress.includes('AI') ? `⏳ ${batchProgress}` : '✨ Tümünü AI ile Çiz'}
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={fetchAllWebImages}
          disabled={isRendering || isBatchGenerating}
          title="Tüm sahneler için internetten canlı telifsiz gerçek fotoğraflar ara ve bağla"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: '#ffffff',
            fontWeight: 600,
            border: 'none',
            padding: '6px 12px'
          }}
        >
          {isBatchGenerating && batchProgress.includes('internet') ? `⏳ ${batchProgress}` : '🌐 Tümünü Web\'den Bul'}
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={generateAllLipSync}
          disabled={isRendering || isBatchGenerating}
          title="Tüm konuşan sahnelerin karakterlerini seslendirmeyle dudak senkronuna al"
          style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
            color: '#ffffff',
            fontWeight: 600,
            border: 'none',
            padding: '6px 12px'
          }}
        >
          {isBatchGenerating && batchProgress.includes('dudak') ? `⏳ ${batchProgress}` : '👄 Tümünü Dudak Senkronla'}
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={addScene}
          disabled={isRendering || isBatchGenerating}
          title="Yeni bir sahne ekle"
        >
          ➕ Yeni Sahne
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={autoReassignImages}
          disabled={isRendering || isBatchGenerating}
          title="Tüm kareleri role göre otomatik yeniden eşle"
        >
          🎲 Yeniden Eşle
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={onCancel}
          disabled={isRendering}
        >
          ✕ İptal
        </button>
        <button
          type="button"
          className="btn primary storyboard-render-btn"
          onClick={() => onConfirmAndRender(scenes)}
          disabled={isRendering || scenes.length === 0 || isBatchGenerating}
          style={{
            fontWeight: 700,
            padding: '8px 20px',
            boxShadow: '0 4px 16px var(--acc-glow)'
          }}
        >
          {isRendering ? '⏳ Render Ediliyor...' : '🎬 Tasarımı Onayla & Render Et 🚀'}
        </button>
      </div>
    </div>

    {/* Storyboard Sahne Kartları Grid / Akışı */}
    <div className="storyboard-grid">
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
                {Array.from(new Set(roleOptions)).map((r, rIdx) => (
                  <option key={`${r}-${rIdx}`} value={r}>
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
            {/* Dudak Senkronlu Video Önizlemesi */}
            {scene.lipSyncVideoUrl && (
              <video
                src={scene.lipSyncVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            )}

            <div style={{ display: 'flex', gap: 4, zIndex: 2 }}>
              <button
                type="button"
                className="btn sm"
                onClick={() => generateAiImageForScene(idx)}
                disabled={generatingSceneId === scene.id}
                style={{
                  fontSize: 10.5,
                  padding: '3px 7px',
                  background: 'rgba(99, 102, 241, 0.9)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(4px)',
                  fontWeight: 600
                }}
                title="Yapay zekâ ile bu sahne için sıfırdan benzersiz görsel üret"
              >
                {generatingSceneId === scene.id ? '⏳ Çiziyor...' : '✨ AI'}
              </button>

              <button
                type="button"
                className="btn sm"
                onClick={() => fetchWebImageForScene(idx)}
                disabled={generatingSceneId === scene.id}
                style={{
                  fontSize: 10.5,
                  padding: '3px 7px',
                  background: 'rgba(14, 165, 233, 0.9)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(4px)',
                  fontWeight: 600
                }}
                title="İnternetten bu sahneye uygun gerçek fotoğraf ara"
              >
                🌐 Web
              </button>

              <button
                type="button"
                className="btn sm"
                onClick={() => {
                  if (scene.lipSyncVideoUrl) {
                    updateScene(idx, { lipSyncVideoUrl: undefined, lipSyncStatus: 'idle' });
                  } else {
                    generateLipSync(idx);
                  }
                }}
                disabled={lipSyncingSceneId === scene.id}
                style={{
                  fontSize: 10.5,
                  padding: '3px 7px',
                  background: scene.lipSyncVideoUrl
                    ? 'linear-gradient(135deg, #be123c, #9f1239)'
                    : 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(4px)',
                  fontWeight: 600
                }}
                title={scene.lipSyncVideoUrl ? 'Dudak senkronunu kaldır' : 'Seslendirme ile uyumlu dudak senkronu klibi oluştur'}
              >
                {lipSyncingSceneId === scene.id
                  ? '👄 İşleniyor...'
                  : scene.lipSyncVideoUrl
                  ? '👄 Senkron Aktif'
                  : '👄 Dudak'}
              </button>
            </div>

            <button
              type="button"
              className="btn sm primary"
              onClick={() => setActivePickerIndex(idx)}
              style={{
                fontSize: 10.5,
                padding: '3px 9px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              🖼️ Seç / Ara
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

          {/* Konuşmacı Karakter & Seslendirme Cinsiyeti (Kadın / Erkek) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8, alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--mute)', display: 'block', marginBottom: 3 }}>
                🎭 KONUŞMACI KARAKTER
              </label>
              <input
                type="text"
                value={scene.speaker || ''}
                onChange={e => updateScene(idx, { speaker: e.target.value })}
                placeholder={idx % 2 === 0 ? 'örn: Dış Ses Anlatıcı' : 'örn: Başrol Karakter'}
                style={{ width: '100%', fontSize: 12, padding: '5px 8px', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--mute)', display: 'block', marginBottom: 3 }}>
                SES CİNSİYETİ
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  className={`btn sm ${scene.voiceGender === 'male' || (!scene.voiceGender && idx % 2 === 0) ? 'primary' : ''}`}
                  onClick={() => updateScene(idx, { voiceGender: 'male' })}
                  style={{ flex: 1, padding: '4px 6px', fontSize: 11 }}
                  title="Puck - Tok Erkek Sesi"
                >
                  👨 Erkek
                </button>
                <button
                  type="button"
                  className={`btn sm ${scene.voiceGender === 'female' || (!scene.voiceGender && idx % 2 === 1) ? 'primary' : ''}`}
                  onClick={() => updateScene(idx, { voiceGender: 'female' })}
                  style={{ flex: 1, padding: '4px 6px', fontSize: 11 }}
                  title="Kore - Doğal Kadın Sesi"
                >
                  👩 Kadın
                </button>
              </div>
            </div>
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

