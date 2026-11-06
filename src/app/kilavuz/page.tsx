'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { KlaketLogo } from '@/components/KlaketLogo';

export default function KilavuzPage() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('klaket_theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch {
      // ignore
    }

    fetch('/api/guide')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.content) {
          setContent(data.content);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('klaket_theme', nextTheme);
    } catch {
      // ignore
    }
  };

  return (
    <div className="wrap" style={{ maxWidth: 1040, padding: '30px 20px 100px' }}>
      {/* Üst Navigasyon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid var(--line)',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <Link
          href="/"
          className="btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <span>←</span>
          <KlaketLogo size={24} animated={false} />
          <span>Klaket AI Stüdyosu&apos;na Dön</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn sm"
            onClick={() => window.print()}
            title="Kılavuzu yazdır veya PDF olarak kaydet"
          >
            🖨️ Yazdır / PDF
          </button>
          <button
            type="button"
            className="btn sm"
            onClick={toggleTheme}
            title="Temayı Değiştir"
          >
            {theme === 'light' ? '🌙 Koyu' : '☀️ Açık'}
          </button>
        </div>
      </div>

      {/* Kılavuz Kartı */}
      <div
        className="panel"
        style={{
          padding: '36px',
          borderRadius: 16,
          background: 'var(--card)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--mute)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p>Kullanım kılavuzu yükleniyor...</p>
          </div>
        ) : (
          <GuideInlineReader content={content} />
        )}
      </div>
    </div>
  );
}

function GuideInlineReader({ content }: { content: string }) {
  // Inline reader uses simple rendering
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 36 }}>📖</div>
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>Klaket Studio – Kullanım Kılavuzu</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--mute)', fontSize: 13.5 }}>
            Kaynak Dosya: <code>kullanim.md</code> · 24 Adımlı Endüstriyel Yapım Rehberi
          </p>
        </div>
      </div>

      <div
        style={{
          padding: '16px 20px',
          background: 'var(--card-sub)',
          borderRadius: 12,
          marginBottom: 28,
          border: '1px solid var(--line)',
          fontSize: 13.5
        }}
      >
        💡 <strong>İpucu:</strong> Bu sayfa ana dizindeki <code>kullanim.md</code> dosyasından dinamik olarak beslenir. Değişiklik yaptığınızda sayfayı yenilemeniz yeterlidir.
      </div>

      <pre
        style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-main)',
          fontSize: 14.5,
          lineHeight: 1.7,
          color: 'var(--ink)'
        }}
      >
        {content}
      </pre>
    </div>
  );
}
