'use client';

interface HeaderProps {
  theme: 'dark' | 'light';
  mode: 'ai' | 'classic';
  onToggleTheme: () => void;
  onToggleMode: (mode: 'ai' | 'classic') => void;
  onOpenSettings: () => void;
}

export function Header({ theme, mode, onToggleTheme, onToggleMode, onOpenSettings }: HeaderProps) {
  return (
    <header>
      <div className="brand">
        <div className="brand-icon" aria-hidden="true">🎬</div>
        <div className="brand-info">
          <h1>Klaket Stüdyosu</h1>
          <p>
            {mode === 'ai'
              ? '✨ Yapay Zekâ Modu: Gemini 2.5 Flash Senaryo & Gemini AI Doğal Seslendirme'
              : '⚡ Klasik Mod: Standart SOP Şablonları & Web Speech Yerel Seslendirme'}
          </p>
        </div>
        <span className={`badge ${mode === 'ai' ? 'badge-ai' : 'sop'}`}>
          {mode === 'ai' ? '✨ Yapay Zekâ Aktif' : '⚡ Klasik / Şablon'}
        </span>
      </div>

      <div className="hdr-acts">
        {/* Mod Değiştirici Buton Grubu */}
        <div className="mode-toggle-group" role="group" aria-label="Çalışma Modu">
          <button
            type="button"
            className={`btn sm ${mode === 'ai' ? 'primary' : ''}`}
            onClick={() => onToggleMode('ai')}
            title="Yapay Zekâ ile üret (Gemini LLM & TTS)"
          >
            ✨ Yapay Zekâ Modu
          </button>
          <button
            type="button"
            className={`btn sm ${mode === 'classic' ? 'primary' : ''}`}
            onClick={() => onToggleMode('classic')}
            title="Eski / Klasik şablon modu ile üret"
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
