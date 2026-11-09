'use client';

import { useState, useEffect, useCallback } from 'react';
import { ALL_CURATED_ASSETS } from '@/lib/assets';

interface VisualPickerModalProps {
  currentUrl?: string;
  sceneRole: string;
  visualPrompt?: string;
  ratio?: string;
  briefType?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

interface WebSearchResult {
  url: string;
  title: string;
  width: number;
  height: number;
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
  const [activeTab, setActiveTab] = useState<'web' | 'ai' | 'library' | 'url'>('web');

  // Web Search State
  const initialWebQuery = (visualPrompt || sceneRole)
    .replace(/award-winning|cinematic|35mm film still|shot on|arri alexa|panavision|anamorphic primes|dramatic cinematic lighting|color graded in davinci resolve|8k resolution|photorealistic|hyperdetailed|volumetric rim lighting|subtle film grain|movie scene|hasselblad|national geographic|bbc earth/gi, ' ')
    .replace(/[,\.:\"\'\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 3)
    .join(' ');

  const [webQuery, setWebQuery] = useState(initialWebQuery || sceneRole);
  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [hasSearchedWeb, setHasSearchedWeb] = useState(false);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState(visualPrompt || sceneRole);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);

  // Library State
  const [filter, setFilter] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState('');

  // Custom URL State
  const [customUrl, setCustomUrl] = useState('');

  // Otomatik ilk web aramasını gerçekleştir
  const handleSearchWeb = useCallback(async (queryToSearch: string) => {
    if (!queryToSearch || !queryToSearch.trim()) return;
    setIsSearchingWeb(true);
    setHasSearchedWeb(true);
    try {
      const res = await fetch(`/api/web-image?q=${encodeURIComponent(queryToSearch.trim())}&limit=12`);
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setWebResults(data.results);
      } else {
        setWebResults([]);
      }
    } catch {
      setWebResults([]);
    } finally {
      setIsSearchingWeb(false);
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (activeTab === 'web' && !hasSearchedWeb && webQuery.trim()) {
      timer = setTimeout(() => {
        handleSearchWeb(webQuery);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeTab, hasSearchedWeb, webQuery, handleSearchWeb]);

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
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 880, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Başlık ve Sahne Bilgisi */}
        <div className="modal-hdr" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              🖼️ Sahne Görseli Seçici & Üretici
            </h3>
            <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 4 }}>
              Hedef Sahne: <strong style={{ color: 'var(--acc)' }}>{sceneRole}</strong> · İnternetten canlı fotoğraf arayın, Yapay Zekâ ile sıfırdan çizin veya kütüphaneden seçin.
            </div>
          </div>
          <button type="button" className="btn sm" onClick={onClose}>✕</button>
        </div>

        {/* Ana Navigasyon Sekmeleri */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
          <button
            type="button"
            className={`btn sm ${activeTab === 'web' ? 'primary' : ''}`}
            onClick={() => setActiveTab('web')}
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            🌐 İnternetten Canlı Ara (Wikimedia)
          </button>
          <button
            type="button"
            className={`btn sm ${activeTab === 'ai' ? 'primary' : ''}`}
            onClick={() => setActiveTab('ai')}
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ✨ Yapay Zekâ ile Çiz (Flux/Turbo AI)
          </button>
          <button
            type="button"
            className={`btn sm ${activeTab === 'library' ? 'primary' : ''}`}
            onClick={() => setActiveTab('library')}
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            📁 Fotoğraf Kütüphanesi ({ALL_CURATED_ASSETS.length})
          </button>
          <button
            type="button"
            className={`btn sm ${activeTab === 'url' ? 'primary' : ''}`}
            onClick={() => setActiveTab('url')}
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            🔗 Özel URL
          </button>
        </div>

        {/* SEKME 1: İNTERNETTEN CANLI ARAMA */}
        {activeTab === 'web' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12, flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={webQuery}
                onChange={e => setWebQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchWeb(webQuery)}
                placeholder="İnternette aramak istediğiniz konuyu yazın (örn: Kapadokya balonları, espresso kahve, antik roma, lüks villa)..."
                style={{ flex: 1, padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--card-sub)' }}
              />
              <button
                type="button"
                className="btn sm primary"
                disabled={isSearchingWeb || !webQuery.trim()}
                onClick={() => handleSearchWeb(webQuery)}
                style={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '8px 16px' }}
              >
                {isSearchingWeb ? '⏳ Aranıyor...' : '🔍 Canlı Ara'}
              </button>
            </div>

            <div style={{ fontSize: 11, color: 'var(--mute)' }}>
              Wikimedia Commons üzerinden telifsiz, yüksek çözünürlüklü gerçek fotoğraflar canlı çekilir. Tıklayarak anında bu sahneye uygulayın.
            </div>

            {/* Sonuç Grid'i */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 280, paddingRight: 4 }}>
              {isSearchingWeb ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--mute)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🌐</div>
                  İnternetten gerçek fotoğraflar getiriliyor...
                </div>
              ) : webResults.length > 0 ? (
                <div className="visual-picker-grid">
                  {webResults.map((item, idx) => {
                    const isSelected = currentUrl === item.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          onSelect(item.url);
                          onClose();
                        }}
                        style={{
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: isSelected ? '2px solid var(--acc)' : '1px solid var(--line)',
                          background: 'var(--card-sub)',
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        className="asset-hover-card"
                      >
                        <div
                          style={{
                            height: 110,
                            backgroundImage: `url("${item.url}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative'
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 4,
                              right: 4,
                              fontSize: 9,
                              fontWeight: 600,
                              padding: '2px 5px',
                              borderRadius: 3,
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff'
                            }}
                          >
                            {item.width}x{item.height}
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
                        <div
                          style={{
                            padding: '6px 8px',
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'var(--ink)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={item.title}
                        >
                          {item.title || 'İnternet Fotoğrafı'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : hasSearchedWeb ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--mute)' }}>
                  Bu arama için görsel bulunamadı. Lütfen &quot;kahve&quot;, &quot;villa&quot;, &quot;cappadocia&quot; gibi farklı bir anahtar kelime deneyin.
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* SEKME 2: YAPAY ZEKÂ İLE ÇİZ (FLUX/TURBO AI) */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14 }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))', border: '1px solid var(--acc)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--acc)' }}>
                  ✨ Yapay Zekâ Sahne Üretici (Flux AI / SDXL Turbo)
                </span>
                {aiResultUrl && (
                  <span style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 600 }}>
                    ✓ AI Görseli Başarıyla Üretildi ve Seçildi
                  </span>
                )}
              </div>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                rows={3}
                placeholder="Yapay zekâ görsel promptu (örn: Sinematik 35mm film karesi, Kapadokya peri bacaları üzerinde gün doğumunda uçan renkli sıcak hava balonları, Arri Alexa LF, photorealistic 8k)..."
                style={{ width: '100%', padding: '10px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--card-sub)', color: 'var(--ink)', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  className="btn primary"
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  onClick={handleGenerateAiImage}
                  style={{ fontWeight: 600, padding: '8px 20px' }}
                >
                  {isGeneratingAi ? '⏳ Yapay Zekâ Çiziyor...' : '🎨 AI ile Sıfırdan Üret'}
                </button>
              </div>
            </div>

            {aiResultUrl && (
              <div style={{ textAlign: 'center', padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Son Üretilen AI Görseli:</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aiResultUrl}
                  alt="AI Generated"
                  style={{ maxHeight: 220, borderRadius: 8, border: '2px solid var(--acc)', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
        )}

        {/* SEKME 3: SEÇKİN FOTOĞRAF KÜTÜPHANESİ */}
        {activeTab === 'library' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12, flex: 1, minHeight: 0 }}>
            <div className="modal-filter-bar">
              <div className="modal-pill-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
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
                  🎬 Sinema
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'belgesel' ? 'primary' : ''}`}
                  onClick={() => setFilter('belgesel')}
                >
                  🎙️ Belgesel
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'spor' ? 'primary' : ''}`}
                  onClick={() => setFilter('spor')}
                >
                  ⚽ Futbol & Spor
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'turizm' ? 'primary' : ''}`}
                  onClick={() => setFilter('turizm')}
                >
                  🎈 Kapadokya/Turizm
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'kahve' ? 'primary' : ''}`}
                  onClick={() => setFilter('kahve')}
                >
                  ☕ Kahve/Gastronomi
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'saglik' ? 'primary' : ''}`}
                  onClick={() => setFilter('saglik')}
                >
                  🏥 Sağlık/Tıp
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'otomotiv' ? 'primary' : ''}`}
                  onClick={() => setFilter('otomotiv')}
                >
                  🏎️ Otomotiv
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'emlak' ? 'primary' : ''}`}
                  onClick={() => setFilter('emlak')}
                >
                  🏢 Lüks Emlak
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'doga' ? 'primary' : ''}`}
                  onClick={() => setFilter('doga')}
                >
                  🌿 Doğa
                </button>
                <button
                  type="button"
                  className={`btn sm ${filter === 'teknoloji' ? 'primary' : ''}`}
                  onClick={() => setFilter('teknoloji')}
                >
                  💻 Teknoloji
                </button>
              </div>
              <input
                type="text"
                placeholder="Kütüphanede ara..."
                value={librarySearch}
                onChange={e => setLibrarySearch(e.target.value)}
                className="modal-search-input"
              />
            </div>

            <div className="visual-picker-grid" style={{ flex: 1, overflowY: 'auto', minHeight: 280 }}>
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
        )}

        {/* SEKME 4: ÖZEL URL GİRİŞİ */}
        {activeTab === 'url' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--ink)' }}>
              Kendi sunucunuzdan veya internetten doğrudan bir görsel linki yapıştırabilirsiniz:
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="https://example.com/resim.jpg"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--card-sub)' }}
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
          </div>
        )}
      </div>
    </div>
  );
}
