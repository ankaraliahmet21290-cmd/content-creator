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
        return '🎬 Sinema Modu: 21:9 Cinemascope Geniş Ekran, 3-Perde Dramatik Kurgu & Hollywood Fragman Anlatımı';
      case 'belgesel':
        return '🎙️ Belgesel Modu: 16:9 / 21:9 Geniş Ekran, BBC & National Geographic Araştırma Kurgusu & Usta Anlatıcı Sesi';
      case 'youtube':
        return '🔴 YouTube Modu: 16:9 Full HD, İlk 5 Sn Kancası, Retention Akışı & Abone Ol Çağrısı';
      case 'reklam':
        return '📢 AI Reklam Modu: Gemini 2.5 Flash ile TV & Sosyal Medya Ticari Tanıtım Kurgusu';
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
    <header>
      <div className="brand">
        <div className="brand-icon" aria-hidden="true">🎬</div>
        <div className="brand-info">
          <h1>Klaket Stüdyosu</h1>
          <p>{getSubDesc()}</p>
        </div>
        <span className={`badge ${getBadgeClass()}`}>
          {getBadgeText()}
        </span>
      </div>

      <div className="hdr-acts">
        {/* Mod Değiştirici Buton Grubu */}
        <div className="mode-toggle-group" role="group" aria-label="Çalışma Modu">
          <button
            type="button"
            className={`btn sm ${mode === 'sinema' ? 'primary btn-cinema-mode' : ''}`}
            onClick={() => onToggleMode('sinema')}
            title="Sinema Filmi ve Fragman Modu (21:9 Cinemascope)"
          >
            🎬 Sinema Modu
          </button>
          <button
            type="button"
            className={`btn sm ${mode === 'belgesel' ? 'primary btn-documentary-mode' : ''}`}
            onClick={() => onToggleMode('belgesel')}
            title="Sinematik Belgesel Modu (BBC / NatGeo / TRT Belgesel)"
          >
            🎙️ Belgesel Modu
          </button>
          <button
            type="button"
            className={`btn sm ${mode === 'youtube' ? 'primary btn-youtube-mode' : ''}`}
            onClick={() => onToggleMode('youtube')}
            title="YouTube Video Modu (16:9 Full HD)"
          >
            🔴 YouTube Modu
          </button>
          <button
            type="button"
            className={`btn sm ${mode === 'reklam' ? 'primary' : ''}`}
            onClick={() => onToggleMode('reklam')}
            title="Ticari Reklam ve Tanıtım Modu"
          >
            📢 Reklam Modu
          </button>
          <button
            type="button"
            className={`btn sm ${mode === 'classic' ? 'primary' : ''}`}
            onClick={() => onToggleMode('classic')}
            title="Eski / Klasik şablon modu"
          >
            ⚡ Klasik Mod
          </button>
        </div>

        <button
          type="button"
          className="btn sm"
          onClick={onOpenSettings}
          title="Sağlayıcı ve API Yapılandırması"
        >
          ⚙️ Ayarlar
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={onToggleTheme}
          title="Temayı Değiştir"
        >
          {theme === 'light' ? '🌙 Koyu Mod' : '☀️ Beyaz Mod'}
        </button>
      </div>
    </header>
  );
}
