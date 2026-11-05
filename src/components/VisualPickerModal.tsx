'use client';

import { useState } from 'react';
import { ALL_CURATED_ASSETS, VisualAssetItem } from '@/lib/assets';

interface VisualPickerModalProps {
  currentUrl?: string;
  sceneRole: string;
  visualPrompt?: string;
  ratio?: string;
  briefType?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function VisualPickerModal({
  currentUrl,
  sceneRole,
  visualPrompt,
  ratio,
  briefType,
  onSelect,
  onClose
}: VisualPickerModalProps) {
  const [filter, setFilter] = useState<'all' | 'sinema' | 'youtube' | 'emlak'>('all');
  const [search, setSearch] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [aiPrompt, setAiPrompt] = useState(visualPrompt || sceneRole);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);

  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          ratio: ratio || '21:9',
          role: sceneRole,
          type: briefType || 'sinema'
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setAiResultUrl(data.imageUrl);
        onSelect(data.imageUrl);
      }
    } catch {
      // ignore
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const filteredAssets = ALL_CURATED_ASSETS.filter(item => {
    if (filter !== 'all' && item.category !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 840, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-hdr" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>🎬 Sahne Görseli Seçici</h3>
            <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 4 }}>
              Hedef Sahne Rolü: <strong style={{ color: 'var(--acc)' }}>{sceneRole}</strong> · Arşivden kare seçin veya özel URL ekleyin
            </div>
          </div>
          <button type="button" className="btn sm" onClick={onClose}>✕</button>
        </div>

        {/* ✨ Yapay Zekâ ile Sıfırdan Görsel Üret (Flux AI) */}
        <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))', border: '1px solid var(--acc)', borderRadius: 10, padding: '12px 14px', marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--acc)' }}>
              ✨ Yapay Zekâ ile Bu Sahneye Özel Görsel Tasarla (Prompt-to-Image)
            </span>
            {aiResultUrl && (
              <span style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 600 }}>
                ✓ AI Görseli Üretildi ve Seçildi
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Yapay zekâ görsel promptu (örn: siberpunk yağmurlu sokak, dedektif, neon ışıklar)..."
              style={{ flex: 1, padding: '7px 12px', fontSize: 12.5 }}
            />
            <button
              type="button"
              className="btn sm primary"
              disabled={isGeneratingAi || !aiPrompt.trim()}
              onClick={handleGenerateAiImage}
              style={{ whiteSpace: 'nowrap', fontWeight: 600 }}
            >
              {isGeneratingAi ? '⏳ AI Çiziyor...' : '🎨 AI Görseli Üret'}
            </button>
          </div>
        </div>

        {/* Filtre ve Arama Çubuğu */}
        <div style={{ display: 'flex', gap: 10, margin: '14px 0 10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className={`btn sm ${filter === 'all' ? 'primary' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tümü ({ALL_CURATED_ASSETS.length})
            </button>
            <button
              type="button"
              className={`btn sm ${filter === 'sinema' ? 'primary' : ''}`}
              onClick={() => setFilter('sinema')}
            >
              🎬 Sinema (22)
            </button>
            <button
              type="button"
              className={`btn sm ${filter === 'youtube' ? 'primary' : ''}`}
              onClick={() => setFilter('youtube')}
            >
              🔴 YouTube (6)
            </button>
            <button
              type="button"
              className={`btn sm ${filter === 'emlak' ? 'primary' : ''}`}
              onClick={() => setFilter('emlak')}
            >
              🏢 Emlak & Ofis
            </button>
          </div>
          <input
            type="text"
            placeholder="Kare ara (örn: siber, uzay, dedektif, patlama)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '6px 12px', fontSize: 13, borderRadius: 8 }}
          />
        </div>

        {/* Özel URL Girişi */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Veya harici bir görsel linki yapıştırın (https://...)"
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            style={{ flex: 1, padding: '7px 12px', fontSize: 12 }}
          />
          <button
            type="button"
            className="btn sm primary"
            disabled={!customUrl.trim()}
            onClick={() => {
              if (customUrl.trim()) {
                onSelect(customUrl.trim());
                onClose();
              }
            }}
          >
            🔗 Bu Linki Kullan
          </button>
        </div>

        {/* Görsel Galerisi Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
            paddingRight: 4
          }}
        >
          {filteredAssets.map(asset => {
            const isSelected = currentUrl === asset.url;
            return (
              <div
                key={asset.url}
                onClick={() => {
                  onSelect(asset.url);
                  onClose();
                }}
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: isSelected ? '2px solid var(--acc)' : '1px solid var(--line)',
                  background: 'var(--card-sub)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                className="asset-hover-card"
              >
                <div
                  style={{
                    height: 100,
                    backgroundImage: `url("${asset.url}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff'
                    }}
                  >
                    {asset.tag}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'var(--ok)',
                        color: '#fff',
                        fontWeight: 700
                      }}
                    >
                      ✓ Seçili
                    </span>
                  )}
                </div>
                <div style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                  {asset.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

