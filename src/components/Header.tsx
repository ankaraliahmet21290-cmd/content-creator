'use client';

import { AppMode } from '@/types';

interface HeaderProps {
  theme: 'dark' | 'light';
  mode: AppMode;
  onToggleTheme: () => void;
  onToggleMode: (mode: AppMode) => void;
  onOpenSettings: () => void;
}

export function Header({ theme, mode, onToggleTheme, onToggleMode, onOpenSettings }: HeaderProps) {
  const getSubDesc = () => {
    switch (mode) {
      case 'sinema':
        return '🎬 AI Sinema Modu: Flux AI Fotogerçekçi 35mm Film Sahneleri & Gemini 24kHz Hollywood Fragman Seslendirmesi';
      case 'belgesel':
        return '🎙️ AI Belgesel Modu: Fotogerçekçi Belgesel Kareleri & Gemini 24kHz Usta Anlatıcı Seslendirmesi';
      case 'youtube':
        return '🔴 AI YouTube Modu: 16:9 Full HD, Gerçekçi Stüdyo Sahneleri & Dinamik AI Anlatımı';
      case 'reklam':
        return '📢 AI Reklam Modu: Fotogerçekçi Ticari Sahneler & Gemini 24kHz TV Reklam Seslendirmesi';
      case 'classic':
      default:
        return '⚡ Klasik Mod: Standart SOP Şablonları & Web Speech Yerel Seslendirme';
    }
  };

  const getBadgeClass = () => {
    switch (mode) {
      case 'sinema':
        return 'badge-cinema';
      case 'belgesel':
        return 'badge-documentary';
      case 'youtube':
        return 'badge-youtube';
      case 'reklam':
        return 'badge-ai';
      default:
        return 'sop';
    }
  };

  const getBadgeText = () => {
    switch (mode) {
      case 'sinema':
        return '🎬 Sinema Modu Aktif';
      case 'belgesel':
        return '🎙️ Belgesel Modu Aktif';
      case 'youtube':
        return '🔴 YouTube Modu Aktif';
      case 'reklam':
        return '📢 Reklam Modu Aktif';
      default:
        return '⚡ Klasik / Şablon';
    }
  };

  return (
    <header className="app-header">
      <div className="header-top-row">
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">🎬</div>
          <div className="brand-info">
            <h1>Klaket Stüdyosu</h1>
            <p className="brand-desc">{getSubDesc()}</p>
          </div>
          <span className={`badge ${getBadgeClass()} brand-badge`}>
            {getBadgeText()}
          </span>
        </div>

        <div className="hdr-actions">
          <button
            type="button"
            className="btn sm hdr-act-btn"
            onClick={onOpenSettings}
            title="Sağlayıcı ve API Yapılandırması"
          >
            ⚙️ <span className="hdr-btn-text">Ayarlar</span>
          </button>
          <button
            type="button"
            className="btn sm hdr-act-btn"
            onClick={onToggleTheme}
            title="Temayı Değiştir"
          >
            {theme === 'light' ? '🌙' : '☀️'} <span className="hdr-btn-text">{theme === 'light' ? 'Koyu' : 'Açık'}</span>
          </button>
        </div>
      </div>

      {/* Mod Değiştirici Buton Grubu */}
      <div className="mode-toggle-wrap">
        <div className="mode-toggle-group" role="group" aria-label="Çalışma Modu">
          <button
            type="button"
            className={`btn sm mode-btn ${mode === 'sinema' ? 'primary btn-cinema-mode active-mode' : ''}`}
            onClick={() => onToggleMode('sinema')}
            title="Sinema Filmi ve Fragman Modu (21:9 Cinemascope)"
          >
            🎬 Sinema Modu
          </button>
          <button
            type="button"
            className={`btn sm mode-btn ${mode === 'belgesel' ? 'primary btn-documentary-mode active-mode' : ''}`}
            onClick={() => onToggleMode('belgesel')}
            title="Sinematik Belgesel Modu (BBC / NatGeo / TRT Belgesel)"
          >
            🎙️ Belgesel Modu
          </button>
          <button
            type="button"
            className={`btn sm mode-btn ${mode === 'youtube' ? 'primary btn-youtube-mode active-mode' : ''}`}
            onClick={() => onToggleMode('youtube')}
            title="YouTube Video Modu (16:9 Full HD)"
          >
            🔴 YouTube Modu
          </button>
          <button
            type="button"
            className={`btn sm mode-btn ${mode === 'reklam' ? 'primary active-mode' : ''}`}
            onClick={() => onToggleMode('reklam')}
            title="Ticari Reklam ve Tanıtım Modu"
          >
            📢 Reklam Modu
          </button>
          <button
            type="button"
            className={`btn sm mode-btn ${mode === 'classic' ? 'primary active-mode' : ''}`}
            onClick={() => onToggleMode('classic')}
            title="Eski / Klasik şablon modu"
          >
            ⚡ Klasik Mod
          </button>
        </div>
      </div>
    </header>
  );
}
