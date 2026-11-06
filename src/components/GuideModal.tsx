'use client';

import { useState, useEffect, useMemo } from 'react';

interface GuideModalProps {
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: string;
}

const TOC_SECTIONS: Section[] = [
  { id: '1-hizli-baslangic--kurulum', title: '1. Hızlı Başlangıç & Kurulum', icon: '🚀' },
  { id: '2-arayuz-genel-bakis', title: '2. Arayüz Genel Bakış', icon: '🖥️' },
  { id: '3-adim-adim-video-uretimi', title: '3. Adım Adım Video Üretimi', icon: '🎬' },
  { id: '4-one-cikan-gelismis-ozellikler', title: '4. Gelişmiş Özellikler', icon: '✨' },
  { id: '5-storyboard-masasinda-sahne-duzenleme', title: '5. Storyboard Masası', icon: '🎨' },
  { id: '6-canli-onizleme-player-ve-1080p-video-indirme', title: '6. Canlı Player & 1080p İndirme', icon: '⬇️' },
  { id: '7-hazir-ilham-sablonlari', title: '7. Hazır Şablonlar', icon: '💡' },
  { id: '8-sikca-sorulan-sorular--sorun-giderme', title: '8. Sıkça Sorulan Sorular', icon: '❓' },
];

export function GuideModal({ onClose }: GuideModalProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/guide')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.ok && data.content) {
            setContent(data.content);
          } else {
            setContent('# Kılavuz yüklenemedi\n\nDosya okunamadı veya sunucu hatası oluştu.');
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setContent('# Kılavuz yüklenemedi\n\nLütfen yerel sunucunuzun çalıştığından emin olun.');
          setLoading(false);
        }
      });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Basit ve güvenli Markdown blok işleyici
  const renderedContent = useMemo(() => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';
    let codeBlockCount = 0;

    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

    const renderInline = (str: string): React.ReactNode => {
      // Bold + link + code parsing
      const parts: React.ReactNode[] = [];
      let lastIdx = 0;
      const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
      let match;

      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIdx) {
          parts.push(str.substring(lastIdx, match.index));
        }
        const m = match[0];
        if (m.startsWith('**') && m.endsWith('**')) {
          parts.push(<strong key={match.index}>{m.slice(2, -2)}</strong>);
        } else if (m.startsWith('*') && m.endsWith('*')) {
          parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
        } else if (m.startsWith('`') && m.endsWith('`')) {
          parts.push(<code key={match.index} className="guide-inline-code">{m.slice(1, -1)}</code>);
        } else if (m.startsWith('[') && m.includes('](')) {
          const textEnd = m.indexOf('](');
          const linkText = m.substring(1, textEnd);
          const linkUrl = m.substring(textEnd + 2, m.length - 1);
          if (linkUrl.startsWith('#')) {
            parts.push(
              <a
                key={match.index}
                href={linkUrl}
                className="guide-link"
                onClick={e => {
                  e.preventDefault();
                  scrollToAnchor(linkUrl.slice(1));
                }}
              >
                {linkText}
              </a>
            );
          } else {
            parts.push(
              <a
                key={match.index}
                href={linkUrl}
                target="_blank"
                rel="noreferrer"
                className="guide-link"
              >
                {linkText} ↗
              </a>
            );
          }
        }
        lastIdx = match.index + m.length;
      }
      if (lastIdx < str.length) {
        parts.push(str.substring(lastIdx));
      }
      return parts.length > 0 ? parts : str;
    };

    lines.forEach((rawLine, idx) => {
      const line = rawLine;

      // Kod blokları başlangıç / bitiş
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          const codeText = codeBuffer.join('\n');
          const currentCodeIdx = codeBlockCount++;
          elements.push(
            <div key={`code-${idx}`} className="guide-code-box">
              <div className="guide-code-header">
                <span className="guide-code-lang">{codeLang || 'terminal'}</span>
                <button
                  type="button"
                  className="btn sm"
                  style={{ padding: '3px 8px', fontSize: 11 }}
                  onClick={() => copyToClipboard(codeText, currentCodeIdx)}
                >
                  {copiedCodeIndex === currentCodeIdx ? '✓ Kopyalandı' : '📋 Kopyala'}
                </button>
              </div>
              <pre className="guide-code-pre">
                <code>{codeText}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = line.trim().slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Başlıklar
      if (line.startsWith('# ')) {
        const text = line.slice(2).trim();
        elements.push(
          <h1 key={`h1-${idx}`} className="guide-h1">
            {text}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        const text = line.slice(3).trim();
        const id = slugify(text);
        elements.push(
          <h2 key={`h2-${idx}`} id={id} className="guide-h2">
            {text}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        const text = line.slice(4).trim();
        const id = slugify(text);
        elements.push(
          <h3 key={`h3-${idx}`} id={id} className="guide-h3">
            {text}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        const text = line.slice(5).trim();
        elements.push(
          <h4 key={`h4-${idx}`} className="guide-h4">
            {text}
          </h4>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={`hr-${idx}`} className="guide-divider" />);
      } else if (line.startsWith('> ')) {
        const text = line.slice(2).trim();
        elements.push(
          <div key={`quote-${idx}`} className="guide-callout">
            <span className="guide-callout-icon">💡</span>
            <div>{renderInline(text)}</div>
          </div>
        );
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().slice(2);
        elements.push(
          <li key={`li-${idx}`} className="guide-list-item">
            {renderInline(text)}
          </li>
        );
      } else if (/^\d+\.\s/.test(line.trim())) {
        const text = line.trim().replace(/^\d+\.\s/, '');
        elements.push(
          <li key={`oli-${idx}`} className="guide-num-item">
            {renderInline(text)}
          </li>
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${idx}`} className="guide-p">
            {renderInline(line)}
          </p>
        );
      }
    });

    return elements;
  }, [content, copiedCodeIndex]);

  return (
    <div className="modal-overlay guide-modal-overlay" onClick={onClose}>
      <div className="modal-content guide-modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Başlığı */}
        <div className="modal-hdr guide-header-bar">
          <div className="guide-header-title">
            <div className="guide-icon">📖</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                Klaket Studio – Kullanım Kılavuzu
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--mute)' }}>
                <code>kullanim.md</code> dosyasından canlı okunan resmi yapım rehberi
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a
              href="/kilavuz"
              target="_blank"
              rel="noreferrer"
              className="btn sm"
              title="Kılavuzu ayrı tam ekran sekmede aç"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <span>Ayrı Sekmede Aç</span> ↗
            </a>
            <button
              type="button"
              className="btn sm"
              onClick={onClose}
              title="Kapat (ESC)"
              style={{ fontSize: 16, padding: '4px 10px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Hızlı Gezinme / İçindekiler Çubuğu */}
        <div className="guide-toc-nav">
          <span className="guide-toc-label">Bölümler:</span>
          <div className="guide-toc-chips">
            {TOC_SECTIONS.map(sec => (
              <button
                key={sec.id}
                type="button"
                className="guide-toc-btn"
                onClick={() => scrollToAnchor(sec.id)}
              >
                <span>{sec.icon}</span> {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* Canlı Arama / Filtreleme Çubuğu */}
        <div className="guide-search-wrap">
          <span className="guide-search-icon">🔍</span>
          <input
            type="text"
            className="guide-search-input"
            placeholder="Kılavuzda ara (örn: Gemini API, Karakter, Fon Müziği, Storyboard, 1080p)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn sm"
              style={{ padding: '2px 8px', fontSize: 11 }}
              onClick={() => setSearchQuery('')}
            >
              Temizle
            </button>
          )}
        </div>

        {/* Kılavuz İçerik Gövdesi */}
        <div className="guide-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--mute)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p>Kılavuz yükleniyor...</p>
            </div>
          ) : searchQuery ? (
            <div className="guide-search-results">
              <p style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 16 }}>
                &ldquo;<strong>{searchQuery}</strong>&rdquo; araması için bulunan eşleşen satırlar:
              </p>
              {content
                .split('\n')
                .filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((line, idx) => (
                  <div key={idx} className="guide-search-match-card">
                    <p style={{ margin: 0, fontSize: 13.5 }}>{line}</p>
                  </div>
                ))}
              {content
                .split('\n')
                .filter(l => l.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--mute)' }}>
                  Arama kriterinize uygun bir bölüm bulunamadı.
                </div>
              )}
            </div>
          ) : (
            <article className="guide-article">{renderedContent}</article>
          )}
        </div>

        {/* Alt Bilgi */}
        <div className="guide-footer">
          <div style={{ fontSize: 12, color: 'var(--mute)' }}>
            💡 Kılavuzu düzenlemek için proje ana dizinindeki <code>kullanim.md</code> dosyasını güncelleyebilirsiniz.
          </div>
          <button type="button" className="btn primary sm" onClick={onClose}>
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
