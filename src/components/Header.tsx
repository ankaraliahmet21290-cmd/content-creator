'use client';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export function Header({ theme, onToggleTheme, onOpenSettings }: HeaderProps) {
  return (
    <header>
      <div className="brand">
        <div className="brand-icon" aria-hidden="true">🎬</div>
        <div className="brand-info">
          <h1>Klaket AI Stüdyosu</h1>
          <p>Brief&apos;ten Senaryoya, Sesten Montaja SOP Uyumlu Otomatik Video Üretimi</p>
        </div>
        <span className="badge sop">SOP v0.2 Standardı</span>
      </div>
      <div className="hdr-acts">
        <button
          type="button"
          className="btn sm"
          onClick={onOpenSettings}
          title="AI Sağlayıcı ve MCP Yapılandırması"
        >
          ⚙️ Sağlayıcı / API
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={onToggleTheme}
          title="Temayı Değiştir"
        >
          {theme === 'dark' ? '☀️ Açık Mod' : '🌙 Koyu Mod'}
        </button>
      </div>
    </header>
  );
}
