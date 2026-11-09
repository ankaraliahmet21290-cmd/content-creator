'use client';

import { useState } from 'react';
import { BriefForm as IBriefForm, Preset, AspectRatio, AppMode, CharacterProfile } from '@/types';
import { TYPES, RATIOS, LANGUAGES, PRESETS, BG_MUSIC_OPTIONS, CHARACTER_PRESETS } from '@/lib/constants';
import { audioMgr } from '@/lib/audio';

interface BriefFormProps {
  form: IBriefForm;
  mode: AppMode;
  isProducing: boolean;
  formError: string;
  onUpdateField: <K extends keyof IBriefForm>(field: K, value: IBriefForm[K]) => void;
  onSelectPreset: (preset: Preset) => void;
  onSubmit: () => void;
  onSubmitStoryboard?: () => void;
}

const CINEMA_GENRES = [
  'Bilim Kurgu & Distopya',
  'Polisiye & Siberpunk',
  'Aksiyon & Macera',
  'Epik Dram & Tarihi',
  'Psikolojik Gerilim',
  'Gizem & Fantastik'
];

const COMMERCIAL_TONES = [
  'Prestijli & Lüks',
  'Enerjik',
  'Profesyonel & Güven Verici',
  'Duygusal & İlham Verici',
  'Samimi'
];

export function BriefForm({
  form,
  mode,
  isProducing,
  formError,
  onUpdateField,
  onSelectPreset,
  onSubmit,
  onSubmitStoryboard
}: BriefFormProps) {
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  const isClassic = mode === 'classic';
  const currentType = form.type;
  const isCinema = currentType === 'sinema';
  const isDocumentary = currentType === 'belgesel';
  const isYouTube = currentType === 'youtube';
  const isSocial = currentType === 'sosyal';
  const isCommercial = !isCinema && !isDocumentary && !isYouTube && !isSocial;

  const character = form.character || CHARACTER_PRESETS[0];
  const isCharEnabled = !!form.character?.enabled;

  const hasAdvancedContent = Boolean(
    (form.points && form.points.trim()) ||
    (form.cta && form.cta.trim()) ||
    (isCinema && form.character?.enabled)
  );

  const handleToggleCharacter = (enabled: boolean) => {
    onUpdateField('character', {
      ...(form.character || CHARACTER_PRESETS[0]),
      enabled
    });
  };

  const handleSelectCharacterPreset = (preset: CharacterProfile) => {
    onUpdateField('character', {
      ...preset,
      enabled: true
    });
  };

  const handleUpdateCharacter = <K extends keyof CharacterProfile>(field: K, val: CharacterProfile[K]) => {
    const cur = form.character || CHARACTER_PRESETS[0];
    const updated = { ...cur, [field]: val };
    if (field !== 'consistencyPrompt') {
      const ageNum = updated.ageGroup.includes('20') ? '28' : updated.ageGroup.includes('30') ? '35' : '50';
      updated.consistencyPrompt = `${ageNum} years old Turkish ${updated.gender === 'female' ? 'woman' : 'man'} named ${updated.name}, ${updated.appearance}, wearing ${updated.clothing}, cinematic 35mm portrait, highly detailed facial features, photorealistic consistent character`;
    }
    onUpdateField('character', updated);
  };

  // Seçili video türüne göre filtreli şablonlar
  const relevantPresets = PRESETS.filter(p => {
    if (isCinema) return p.data.type === 'sinema';
    if (isDocumentary) return p.data.type === 'belgesel';
    if (isYouTube) return p.data.type === 'youtube';
    if (isCommercial) return p.data.type === 'reklam' || p.data.type === 'tanitim' || p.data.type === 'kurumsal';
    if (isSocial) return p.data.type === 'sosyal';
    return true;
  });

  const displayPresets = showAllPresets
    ? PRESETS
    : relevantPresets.length > 0
      ? relevantPresets
      : PRESETS;

  return (
    <section className="panel" aria-labelledby="brief-section-title">
      <div className="panel-hdr">
        <h2 id="brief-section-title">
          {isCinema
            ? '🎬 AI Sinema Filmi & Fragman Stüdyosu'
            : isDocumentary
              ? '🎙️ AI Sinematik Belgesel Stüdyosu'
              : isYouTube
                ? '🔴 AI YouTube Video Stüdyosu'
                : isSocial
                  ? '📱 AI Shorts & Reels Stüdyosu'
                  : isClassic
                    ? '⚡ Klasik Video Brief\'i'
                    : '✨ AI Ticari Reklam Stüdyosu'}
        </h2>
        <span
          className={`badge ${isCinema
              ? 'badge-cinema'
              : isDocumentary
                ? 'badge-documentary'
                : isYouTube
                  ? 'badge-youtube'
                  : isSocial
                    ? 'badge-social'
                    : isClassic
                      ? 'sop'
                      : 'badge-ai'
            }`}
        >
          {isCinema
            ? '21:9 Cinemascope'
            : isDocumentary
              ? '16:9 Belgesel'
              : isYouTube
                ? '16:9 Full HD'
                : isSocial
                  ? '9:16 Dikey Mobil'
                  : isClassic
                    ? 'Kural Şablonu'
                    : 'Gemini 3.6 AI'}
        </span>
      </div>

      {/* Aktif Mod Açıklama Kartı */}
      <div
        className={`mode-banner ${isCinema
            ? 'cinema-banner'
            : isDocumentary
              ? 'documentary-banner'
              : isYouTube
                ? 'youtube-banner'
                : isClassic
                  ? 'classic-banner'
                  : 'ai-banner'
          }`}
      >
        {isCinema ? (
          <div>
            <strong>🎬 Sinema & Fragman Modu:</strong> 21:9 Cinemascope Hollywood kurgusu, <strong>Flux AI fotogerçekçi 35mm film sahneleri</strong>, çoklu karakter diyalogları ve <strong>Gemini stüdyo seslendirmesi</strong>.
          </div>
        ) : isDocumentary ? (
          <div>
            <strong>🎙️ Sinematik Belgesel Modu:</strong> BBC Earth & National Geographic standartlarında araştırma kurgusu, <strong>tarih/arşiv bilgi kartları</strong> ve <strong>Gemini bilge anlatıcı seslendirmesi</strong>.
          </div>
        ) : isYouTube ? (
          <div>
            <strong>🔴 YouTube Modu:</strong> 16:9 Full HD formatında ilk 5 saniye kancası, retention akışı, infografik vurgular ve <strong>enerjik AI anlatımı</strong>.
          </div>
        ) : isSocial ? (
          <div>
            <strong>📱 Shorts & Reels Modu:</strong> 9:16 dikey mobil kurgu, ilk 3 saniye dikkat kilidi ve yüksek tempolu viral seslendirme.
          </div>
        ) : isClassic ? (
          <div>
            <strong>⚡ Klasik Mod:</strong> Standart SOP kural şablonları üzerinden anında senaryo üretir.
          </div>
        ) : (
          <div>
            <strong>✨ Ticari Reklam & Tanıtım Modu:</strong> Satış odaklı değer vaadi (USP), problem-çözüm akışı ve <strong>yüksek dönüşümlü TV/dijital reklam kurgusu</strong>.
          </div>
        )}
      </div>

      {/* 🎬 Hızlı Yapım Türü Seçici */}
      <label style={{ marginTop: 12 }}>
        🎬 Video & Yapım Türü
        <span className="label-hint">(Format ve kurgu tarzını belirler)</span>
      </label>
      <div className="format-pills">
        <button
          type="button"
          className={`format-pill ${isCinema ? 'active' : ''}`}
          onClick={() => {
            onUpdateField('type', 'sinema');
            onUpdateField('ratio', '21:9');
            onUpdateField('tone', 'Sinematik & Dramatik');
            onUpdateField('platform', 'Sinema & Film Festivali (21:9 / 16:9)');
            onUpdateField('bgMusic', 'cinema_epic');
            if (form.dur < 30) onUpdateField('dur', 45);
          }}
        >
          🎬 Sinema Filmi & Fragman
        </button>
        <button
          type="button"
          className={`format-pill ${isDocumentary ? 'active' : ''}`}
          onClick={() => {
            onUpdateField('type', 'belgesel');
            onUpdateField('ratio', '16:9');
            onUpdateField('tone', 'Belgesel & Merak Uyandırıcı');
            onUpdateField('platform', 'YouTube (Yatay 16:9)');
            onUpdateField('bgMusic', 'cinema_epic');
            if (form.dur < 30) onUpdateField('dur', 45);
          }}
        >
          🎙️ Sinematik Belgesel
        </button>
        <button
          type="button"
          className={`format-pill ${isYouTube ? 'active' : ''}`}
          onClick={() => {
            onUpdateField('type', 'youtube');
            onUpdateField('ratio', '16:9');
            onUpdateField('tone', 'YouTube Dinamik & Sürükleyici');
            onUpdateField('platform', 'YouTube (Yatay 16:9)');
            onUpdateField('bgMusic', 'youtube_lofi');
            if (form.dur < 30) onUpdateField('dur', 60);
          }}
        >
          🔴 YouTube Videosu (16:9)
        </button>
        <button
          type="button"
          className={`format-pill ${isCommercial ? 'active' : ''}`}
          onClick={() => {
            onUpdateField('type', 'reklam');
            onUpdateField('ratio', '16:9');
            onUpdateField('tone', 'Enerjik');
            onUpdateField('platform', 'YouTube (Yatay 16:9)');
            onUpdateField('bgMusic', 'sales_corporate');
            if (form.dur > 30) onUpdateField('dur', 25);
          }}
        >
          📢 Ticari Reklam & Tanıtım
        </button>
        <button
          type="button"
          className={`format-pill ${isSocial ? 'active' : ''}`}
          onClick={() => {
            onUpdateField('type', 'sosyal');
            onUpdateField('ratio', '9:16');
            onUpdateField('tone', 'Samimi');
            onUpdateField('platform', 'Instagram Reels');
            onUpdateField('bgMusic', 'sales_corporate');
            if (form.dur > 60) onUpdateField('dur', 30);
          }}
        >
          📱 Shorts & Reels (9:16)
        </button>
      </div>

      {/* Hızlı Şablonlar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <label style={{ margin: 0 }}>
          Hızlı İlham Şablonları
          <span className="label-hint">({TYPES[form.type] || 'Seçili'} Özel)</span>
        </label>
        {PRESETS.length > displayPresets.length && (
          <button
            type="button"
            style={{
              fontSize: 11,
              color: 'var(--acc-light, #38bdf8)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => setShowAllPresets(prev => !prev)}
          >
            {showAllPresets ? 'Sadece İlgilileri Göster' : `Tümünü Göster (${PRESETS.length})`}
          </button>
        )}
      </div>
      <div className="presets" style={{ marginTop: 6 }}>
        {displayPresets.map((p, i) => (
          <button
            key={i}
            id={`preset-${i}`}
            type="button"
            className="preset-chip"
            onClick={() => onSelectPreset(p)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--line)', margin: '14px 0' }} />

      {/* ============================================================ */}
      {/* 1. ANA HIZLI GİRDİ ALANLARI (HER ZAMAN GÖRÜNÜR, FERAHTIR) */}
      {/* ============================================================ */}

      {/* Başlık Alanı (Türe Göre Dinamik Label & Placeholder) */}
      <label htmlFor="input-product">
        {isCinema
          ? '🎬 Film, Fragman veya Eser Adı *'
          : isDocumentary
            ? '🎙️ Belgesel, Keşif veya Araştırma Başlığı *'
            : isYouTube
              ? '🔴 YouTube Video Başlığı veya Konusu *'
              : isSocial
                ? '📱 Trend Video Başlığı veya Konusu *'
                : '📢 Ürün, Marka veya Portföy Adı *'}
      </label>
      <input
        id="input-product"
        value={form.product}
        placeholder={
          isCinema
            ? 'Örn: 2088: Son Şafak (The Last Dawn) veya Zamanın Ötesi'
            : isDocumentary
              ? 'Örn: Gize: Zamana Meydan Okuyan Sırlar veya Mariana Çukuru'
              : isYouTube
                ? 'Örn: Yapay Zekâ Sinema Sektörünü Nasıl Değiştiriyor? veya 2026 AI Donanımları'
                : isSocial
                  ? 'Örn: Bunu Biliyor muydunuz? 3 Hayat Kurtaran İpucu'
                  : 'Örn: Korkmaz Gayrimenkul - Elit Rezidans veya BulutFlow AI'
        }
        onChange={e => onUpdateField('product', e.target.value)}
      />

      {/* Ana Senaryo / Kurgu / Talimat Alanı (Türe Göre Akıllı Kılavuz) */}
      <div className="ai-instructions-box" style={{ marginTop: 12 }}>
        <label htmlFor="ai-instructions" style={{ fontSize: 13.5 }}>
          {isCinema
            ? '✨ Film Hikâyesi, Hazır Senaryo & Karakter Replikleri'
            : isDocumentary
              ? '✨ Belgesel Akışı, Kanca Soru & Yönetmen Talimatı'
              : isYouTube
                ? '✨ YouTube Video Akışı, Bölümler & B-Roll Talimatı'
                : isSocial
                  ? '✨ Hızlı Video Akışı & İpuçları'
                  : '✨ Reklam Senaryo Özeti & İstekler'}
          <span className="label-hint">
            {isCinema
              ? '(Hazır diyaloglarınızı doğrudan yapıştırabilir veya fikrinizi yazabilirsiniz)'
              : isDocumentary
                ? '(Merak kancası, kadim sorular ve görsel atmosfer talimatı)'
                : isYouTube
                  ? '(Giriş vaadi, ana argümanlar ve B-roll geçişleri)'
                  : isSocial
                    ? '(15-30 saniyelik hızlı viral maddeler)'
                    : '(Hedef kitle, öne çıkanlar ve görsel çekim notları)'}
          </span>
        </label>
        <textarea
          id="ai-instructions"
          value={form.customInstructions || ''}
          placeholder={
            isCinema
              ? `İster hazır senaryonuzu veya sahne diyaloglarınızı doğrudan buraya yapıştırın, ister film fikrinizi anlatın:
Örn:
Sahne 1 (Dış Ses - Erkek): "2088 yılında İstanbul derin bir karanlığa gömülmüştü..."
Sahne 2 (Ajan Selin - Kadın): "Sinyali tespit ettik komutanım, zamanımız tükeniyor!"
Sahne 3 (Komutan Demir - Erkek): "Operasyonu hemen başlatın, geri dönüş yok!"
Sahne 4 (Dış Ses): "Nefes kesen bir macera... Çok yakında sinemalarda!"`
              : isDocumentary
                ? 'Örn: BBC Earth ve National Geographic standartlarında bir belgesel kurgula. Kadim bir soru ile başla: Sisli çöl ve gün doğumu drone çekimleri, antik hiyerogliflerin şifresi ve tarihin bilinmeyen yönlerini anlatan bilge, usta bir anlatıcı tonu...'
                : isYouTube
                  ? 'Örn: İzleyiciyi ilk 5 saniyede ekrana kitleyen merak uyandırıcı bir YouTube kancası ile başla. Hollywood\'dan çarpıcı örnekler, B-roll ekran çekimleri ve sonunda kanala abone olma & yorum bırakma çağrısı yap.'
                  : isSocial
                    ? '1. İpucu: Asla ilk teklifi doğrudan kabul etmeyin.\n2. İpucu: Karar vermeden önce 24 saat kuralını uygulayın.\n3. İpucu: Detayları mutlaka yazılı olarak onaylatın.'
                    : 'Örn: Lüks yaşam tarzını ve prestiji öne çıkar. Geniş açı rezidans ve havuz çekimleri, anahtar teslimi anı ve mutlu bir aile karesi yer alsın. Güven veren tok bir ses tonu kullanılsın.'
          }
          rows={5}
          onChange={e => onUpdateField('customInstructions', e.target.value)}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. HİBRİT KATLANABİLİR BÖLÜM: TÜRE ÖZEL DETAYLI PARAMETRELER */}
      {/* ============================================================ */}
      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={() => setShowAdvanced(prev => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 14px',
            borderRadius: 10,
            border: showAdvanced ? '1.5px solid #38bdf8' : '1px solid var(--line)',
            background: showAdvanced
              ? 'rgba(56, 189, 248, 0.08)'
              : 'var(--card-bg, rgba(255, 255, 255, 0.02))',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
            <span style={{ fontSize: 13, color: '#38bdf8' }}>{showAdvanced ? '▼' : '▶'}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--txt)' }}>
                ⚙️ Türe Özel İnce Ayarlar & Parametreler
              </div>
              <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 1 }}>
                {isCinema
                  ? 'Janr, Kilit Çatışma, Karakter Tasarımı & Vizyon CTA'
                  : isDocumentary
                    ? 'Araştırma Alanı, Bilgi Kartları (Mekan/Tarih), Üslup & Çıkarım'
                    : isYouTube
                      ? 'Hedef Niş, 5sn Kancası, Ton & Abone Ol Çağrısı'
                      : isSocial
                        ? '3sn Viral Kancası & Takip/Yorum Çağrısı'
                        : 'USP Satış Vaatleri, Müşteri Profili & Harekete Geçirici CTA'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {hasAdvancedContent && (
              <span
                style={{
                  fontSize: 10.5,
                  padding: '2px 7px',
                  borderRadius: 10,
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  fontWeight: 600
                }}
              >
                ✓ Dolu
              </span>
            )}
            <span style={{ fontSize: 11.5, color: 'var(--mute)' }}>
              {showAdvanced ? 'Gizle' : 'Aç'}
            </span>
          </div>
        </button>

        {showAdvanced && (
          <div
            style={{
              marginTop: 10,
              padding: '14px',
              borderRadius: 10,
              border: '1px solid rgba(56, 189, 248, 0.2)',
              background: 'rgba(56, 189, 248, 0.03)'
            }}
          >
            {/* SİNEMA ÖZEL AYARLARI */}
            {isCinema && (
              <>
                <label>
                  🎭 Film Janrı & Atmosfer
                  <span className="label-hint">(Kurgunun görsel dünyasını belirler)</span>
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {CINEMA_GENRES.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      className="preset-chip"
                      style={{
                        fontSize: 11.5,
                        padding: '3px 9px',
                        borderColor: form.tone === genre ? '#38bdf8' : undefined,
                        background: form.tone === genre ? 'rgba(56, 189, 248, 0.18)' : undefined,
                        color: form.tone === genre ? '#ffffff' : undefined
                      }}
                      onClick={() => {
                        onUpdateField('tone', genre);
                        if (!form.audience || form.audience.includes('sinemasever')) {
                          onUpdateField('audience', `${genre} ve sinemaseverler`);
                        }
                      }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                <label htmlFor="textarea-cinema-points" style={{ marginTop: 10 }}>
                  ⚡ Kilit Olay Örgüsü, Tehdit & Gerilim Unsurları
                  <span className="label-hint">(Her satıra bir çatışma yazın)</span>
                </label>
                <textarea
                  id="textarea-cinema-points"
                  value={form.points}
                  placeholder={`Güneşin doğmadığı siberpunk mega kentte son insan direnişi\nYapay zekanın kontrolündeki gökdelenler ve karanlık yağmurlu sokaklar\nİnsanlığın kaderini belirleyecek son şifre`}
                  rows={3}
                  onChange={e => onUpdateField('points', e.target.value)}
                />

                {/* Tutarlı Karakter Tasarımı */}
                <div
                  style={{
                    marginTop: 12,
                    padding: '12px 14px',
                    background: isCharEnabled ? 'rgba(217, 70, 239, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isCharEnabled ? 'rgba(217, 70, 239, 0.35)' : 'var(--line)'}`,
                    borderRadius: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🎭</span>
                      <div>
                        <strong style={{ color: 'var(--txt)', fontSize: 13 }}>
                          3. & 8. Adım: Tutarlı Karakter Tasarımı (Consistent Character)
                        </strong>
                        <div style={{ color: 'var(--mute)', fontSize: 11.5 }}>
                          Tüm film sahnelerinde başrolün yüzü ve kostümü sabit tutulur.
                        </div>
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={isCharEnabled}
                        onChange={e => handleToggleCharacter(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#d946ef', cursor: 'pointer' }}
                      />
                      <span style={{ color: isCharEnabled ? '#d946ef' : 'var(--mute)', fontSize: 12, fontWeight: 600 }}>
                        {isCharEnabled ? '✓ Karakter Aktif' : 'Karakter Sabitle'}
                      </span>
                    </label>
                  </div>

                  {isCharEnabled && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(217, 70, 239, 0.15)' }}>
                      <label style={{ fontSize: 11.5, color: 'var(--mute)', marginBottom: 4 }}>
                        Hızlı Karakter Şablonu
                      </label>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                        {CHARACTER_PRESETS.map((cp, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectCharacterPreset(cp)}
                            className="preset-chip"
                            style={{
                              fontSize: 11,
                              padding: '3px 8px',
                              borderColor: character.name === cp.name ? '#d946ef' : undefined,
                              background: character.name === cp.name ? 'rgba(217, 70, 239, 0.2)' : undefined,
                              color: character.name === cp.name ? '#ffffff' : undefined
                            }}
                          >
                            {cp.gender === 'male' ? '👨' : '👩'} {cp.name}
                          </button>
                        ))}
                      </div>

                      <div className="row-3" style={{ marginTop: 6 }}>
                        <div>
                          <label style={{ fontSize: 11.5 }}>Karakter Adı</label>
                          <input
                            type="text"
                            value={character.name}
                            onChange={e => handleUpdateCharacter('name', e.target.value)}
                            placeholder="Örn: Kaan Kaya"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5 }}>Cinsiyet</label>
                          <select
                            value={character.gender}
                            onChange={e => handleUpdateCharacter('gender', e.target.value as 'male' | 'female')}
                          >
                            <option value="male">Erkek (Puck)</option>
                            <option value="female">Kadın (Kore)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5 }}>Yaş Grubu</label>
                          <select
                            value={character.ageGroup}
                            onChange={e => handleUpdateCharacter('ageGroup', e.target.value)}
                          >
                            <option value="20-29 Genç">20-29 Genç</option>
                            <option value="30-45 Yetişkin">30-45 Yetişkin</option>
                            <option value="45+ Olgun">45+ Olgun</option>
                          </select>
                        </div>
                      </div>

                      <div className="row" style={{ marginTop: 6 }}>
                        <div>
                          <label style={{ fontSize: 11.5 }}>Fiziksel Özellikler</label>
                          <input
                            type="text"
                            value={character.appearance}
                            onChange={e => handleUpdateCharacter('appearance', e.target.value)}
                            placeholder="Örn: keskin çene, kısa siyah saç"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5 }}>Kostüm & Kıyafet</label>
                          <input
                            type="text"
                            value={character.clothing}
                            onChange={e => handleUpdateCharacter('clothing', e.target.value)}
                            placeholder="Örn: siyah trençkot ve balıkçı kazak"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <label htmlFor="input-cta-cinema" style={{ marginTop: 10 }}>
                  🎟️ Vizyon Tarihi & Fragman Kapanış Notu (CTA)
                </label>
                <input
                  id="input-cta-cinema"
                  value={form.cta}
                  placeholder="Örn: Çok Yakında Sinemalarda ve IMAX Salonlarında."
                  onChange={e => onUpdateField('cta', e.target.value)}
                />
              </>
            )}

            {/* BELGESEL ÖZEL AYARLARI */}
            {isDocumentary && (
              <>
                <label>
                  🧭 Belgesel Alanı & Araştırma Teması
                </label>
                <select
                  value={form.audience}
                  onChange={e => onUpdateField('audience', e.target.value)}
                >
                  <option value="Tarih, arkeoloji ve antik medeniyet araştırması">🏛️ Tarih & Antik Medeniyetler (Mısır, Göbeklitepe, Roma)</option>
                  <option value="Doğa, yaban hayatı ve gezegen ekosistemi araştırması">🌿 Doğa & Yaban Hayatı (Afrika Savanları, Yağmur Ormanları)</option>
                  <option value="Uzay, astronomi ve derin evren kozmolojisi">🚀 Uzay, Kozmoloji & Gezegenler</option>
                  <option value="Derin deniz biyolojisi ve okyanus çukurları">🌊 Derin Deniz & Okyanus Bilimi (Mariana Çukuru)</option>
                  <option value="İleri bilim, yapay zekâ ve geleceğin teknolojileri">🔬 İleri Bilim & Geleceğin Teknolojileri</option>
                  <option value="Kayıp dosyalar, sırlar ve araştırmacı gazetecilik">🕵️ Gizli Dosyalar & Soruşturma Belgeseli</option>
                </select>

                <label htmlFor="textarea-doc-points" style={{ marginTop: 10 }}>
                  📜 Kilit Kanıtlar, Mekânlar & Tarihsel Notlar
                  <span className="label-hint">(Sahne altı bilgi kartlarına [subtitle] basılacak kanıtlar)</span>
                </label>
                <textarea
                  id="textarea-doc-points"
                  value={form.points}
                  placeholder={`M.Ö. 2500 yılında inşa edilen dev blokların astronomik Orion hizalanması\nModern jeoradarların piramidin derinliklerinde tespit ettiği gizli odalar\nMühendislik sınırlarını aşan matematiksel ve mimari kusursuzluk`}
                  rows={3}
                  onChange={e => onUpdateField('points', e.target.value)}
                />

                <div className="row" style={{ marginTop: 10 }}>
                  <div>
                    <label htmlFor="select-doc-tone">🎙️ Anlatıcı Üslubu</label>
                    <select
                      id="select-doc-tone"
                      value={form.tone}
                      onChange={e => onUpdateField('tone', e.target.value)}
                    >
                      <option value="Belgesel & Merak Uyandırıcı">Merak Uyandırıcı & Dingin (David Attenborough)</option>
                      <option value="Bilge & Felsefi Anlatım">Bilge & Felsefi (Morgan Freeman / Kozmos)</option>
                      <option value="Bilimsel, Nesnel & Kanıt Odaklı">Bilimsel, Nesnel & Kanıt Odaklı</option>
                      <option value="Çarpıcı & Soruşturmacı">Çarpıcı & Soruşturmacı (Investigation)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="input-doc-cta">💡 Kapanış Düşüncesi / Çıkarım (CTA)</label>
                    <input
                      id="input-doc-cta"
                      value={form.cta}
                      placeholder="Örn: Bölüm 1 bu akşam yayında. Tarihi yeniden keşfetmeye hazır olun."
                      onChange={e => onUpdateField('cta', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* YOUTUBE ÖZEL AYARLARI */}
            {isYouTube && (
              <>
                <label htmlFor="input-yt-audience">
                  🎯 Hedef İzleyici Kitlesi & Niş
                </label>
                <input
                  id="input-yt-audience"
                  value={form.audience}
                  placeholder="Örn: Teknoloji meraklıları, yazılımcılar, YouTube içerik üreticileri"
                  onChange={e => onUpdateField('audience', e.target.value)}
                />

                <label htmlFor="input-yt-hook" style={{ marginTop: 10 }}>
                  🪝 İlk 5 Saniye Kancası (Audience Retention Hook)
                  <span className="label-hint">(İzleyiciyi videoda tutacak şok edici soru veya iddia)</span>
                </label>
                <textarea
                  id="input-yt-hook"
                  value={form.points}
                  placeholder={`Hollywood'un 100 yıldır sakladığı büyük sır, yapay zeka ile 1 gecede çöktü!\nTek bir kişi artık dev film stüdyolarına kafa tutabiliyor.`}
                  rows={2}
                  onChange={e => onUpdateField('points', e.target.value)}
                />

                <div className="row" style={{ marginTop: 10 }}>
                  <div>
                    <label htmlFor="select-yt-tone">🎙️ Anlatım Tonu</label>
                    <select
                      id="select-yt-tone"
                      value={form.tone}
                      onChange={e => onUpdateField('tone', e.target.value)}
                    >
                      <option value="YouTube Dinamik & Sürükleyici">YouTube Dinamik & Sürükleyici</option>
                      <option value="Samimi Sohbet & Vlog">Samimi Sohbet & Vlog</option>
                      <option value="Eğitici & Açıklayıcı">Eğitici & Açıklayıcı (Tutorial)</option>
                      <option value="Hızlı Tempolu & Eğlenceli">Hızlı Tempolu & Eğlenceli</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="input-yt-cta">🔔 Abone Ol / Like Çağrısı (CTA)</label>
                    <input
                      id="input-yt-cta"
                      value={form.cta}
                      placeholder="Örn: Videoyu beğendiyseniz kanala abone olmayı ve zili açmayı unutmayın!"
                      onChange={e => onUpdateField('cta', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* TİCARİ REKLAM ÖZEL AYARLARI */}
            {isCommercial && (
              <>
                <label htmlFor="input-com-audience">
                  🎯 Hedef Müşteri Profili
                </label>
                <input
                  id="input-com-audience"
                  value={form.audience}
                  placeholder="Örn: Yatırımcılar, lüks konut arayan aileler, şirket yöneticileri"
                  onChange={e => onUpdateField('audience', e.target.value)}
                />

                <label htmlFor="textarea-com-points" style={{ marginTop: 10 }}>
                  ⭐ Öne Çıkan Satış Avantajları (USP) & Değer Önerileri
                  <span className="label-hint">(Her satıra bir avantaj yazın)</span>
                </label>
                <textarea
                  id="textarea-com-points"
                  value={form.points}
                  placeholder={`Panoramik deniz manzarası ve akıllı ev altyapısı\nLansmana özel %20 peşinat ve 24 ay sıfır faiz avantajı\n7/24 özel güvenlik ve rezidans concierge hizmeti`}
                  rows={3}
                  onChange={e => onUpdateField('points', e.target.value)}
                />

                <label htmlFor="input-com-cta" style={{ marginTop: 10 }}>
                  🚀 Harekete Geçirici Mesaj (Call to Action / CTA)
                </label>
                <input
                  id="input-com-cta"
                  value={form.cta}
                  placeholder="Örn: Özel lansman fırsatları ve kat planları için hemen arayın: 0850 XXX XX XX"
                  onChange={e => onUpdateField('cta', e.target.value)}
                />

                <label htmlFor="select-com-tone" style={{ marginTop: 10 }}>
                  🎭 Reklam Anlatım Tonu
                </label>
                <select
                  id="select-com-tone"
                  value={form.tone}
                  onChange={e => onUpdateField('tone', e.target.value)}
                >
                  {COMMERCIAL_TONES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </>
            )}

            {/* SHORTS ÖZEL AYARLARI */}
            {isSocial && (
              <>
                <label htmlFor="input-soc-hook">
                  ⚡ İlk 3 Saniye Kancası / Öne Çıkan Pozisyon & Bilgiler
                  <span className="label-hint">(Kaydırmayı durduran vuruş cümlesi veya maçın kritik anları)</span>
                </label>
                <textarea
                  id="input-soc-hook"
                  value={form.points}
                  placeholder={`"Nefes kesen 90 dakika ve kaçırılmayacak gol pozisyonları!\nİnanılmaz şut ve köşeye giden 1. gol\nSon dakikalarda maçı koparan muhteşem vuruş"`}
                  rows={3}
                  onChange={e => onUpdateField('points', e.target.value)}
                />

                <label htmlFor="input-soc-cta" style={{ marginTop: 10 }}>
                  👉 Takip Et & Yorum Bırak Çağrısı (CTA)
                </label>
                <input
                  id="input-soc-cta"
                  value={form.cta}
                  placeholder="Örn: Sizce maçın adamı kimdi? Yorumlara yazın ve takip etmeyi unutmayın!"
                  onChange={e => onUpdateField('cta', e.target.value)}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. ORTAK SESLENDİRME, MÜZİK VE TEKNİK AYARLAR */}
      {/* ============================================================ */}

      {/* SAHNE GÖRSEL KAYNAĞI SEÇİMİ */}
      <div style={{ marginTop: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span>🖼️ Sahne Görselleri Kaynağı</span>
          <span className="label-hint">Videonuzun görsel dünyası nasıl oluşturulsun?</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {/* Seçenek 1: AI ile Sıfırdan Üret */}
          <div
            onClick={() => onUpdateField('visualSource', 'ai_generate')}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              border: (form.visualSource === 'ai_generate' || !form.visualSource) ? '2px solid var(--acc)' : '1px solid var(--line)',
              background: (form.visualSource === 'ai_generate' || !form.visualSource) ? 'rgba(99, 102, 241, 0.12)' : 'var(--card-sub)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <strong style={{ fontSize: 13, color: (form.visualSource === 'ai_generate' || !form.visualSource) ? 'var(--acc)' : 'var(--txt)' }}>
                Yapay Zekâ ile Sıfırdan Üret
              </strong>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--mute)', lineHeight: 1.4 }}>
              Flux & Turbo AI motoru ile senaryonuza ve konunuza özel sinematik foto-gerçekçi kareler anında çizilir.
            </div>
          </div>

          {/* Seçenek 2: İnternetten Canlı Gerçek Fotoğraf Bul */}
          <div
            onClick={() => onUpdateField('visualSource', 'web_search')}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              border: form.visualSource === 'web_search' ? '2px solid #0ea5e9' : '1px solid var(--line)',
              background: form.visualSource === 'web_search' ? 'rgba(14, 165, 233, 0.12)' : 'var(--card-sub)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>🌐</span>
              <strong style={{ fontSize: 13, color: form.visualSource === 'web_search' ? '#0ea5e9' : 'var(--txt)' }}>
                İnternetten Canlı Gerçek Fotoğraf Bul
              </strong>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--mute)', lineHeight: 1.4 }}>
              Wikimedia Commons üzerinden konunuza ait telifsiz, 100+ milyon gerçek yüksek çözünürlüklü fotoğraf canlı taranır.
            </div>
          </div>

          {/* Seçenek 3: Küratörlü Fotoğraf Kütüphanesi */}
          <div
            onClick={() => onUpdateField('visualSource', 'curated')}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              border: form.visualSource === 'curated' ? '2px solid #10b981' : '1px solid var(--line)',
              background: form.visualSource === 'curated' ? 'rgba(16, 185, 129, 0.12)' : 'var(--card-sub)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>📁</span>
              <strong style={{ fontSize: 13, color: form.visualSource === 'curated' ? '#10b981' : 'var(--txt)' }}>
                Seçkin Fotoğraf Kütüphanesi
              </strong>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--mute)', lineHeight: 1.4 }}>
              Turizm, kahve, sağlık, otomotiv, emlak ve teknoloji kategorilerindeki zengin hazır fotoğraf arşivi.
            </div>
          </div>
        </div>
      </div>

      {/* SESLENDİRME SEÇİMİ */}
      {isCinema ? (
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 10,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span style={{ fontSize: 22 }} aria-hidden="true">👥</span>
          <div>
            <strong style={{ color: 'var(--txt)', display: 'block', marginBottom: 2 }}>
              Çoklu Karakter & Seslendirme Kadrosu (Otomatik Kadın / Erkek)
            </strong>
            <span style={{ color: 'var(--mute)', fontSize: 12, lineHeight: 1.4 }}>
              Sinema modunda sahnelerde birden fazla kadın ve erkek karakter konuşabilir. Senaryodaki diyaloğa göre uygun kadın (<em>Kore</em>) veya erkek (<em>Puck</em>) sesi her sahneye otomatik atanır.
            </span>
          </div>
        </div>
      ) : (
        <>
          <label style={{ marginTop: 14 }}>
            🎙️ Gerçek Yapay Zekâ Seslendirmesi (Gemini 24kHz Studio TTS)
          </label>
          <div className="gender-toggle-group">
            <button
              type="button"
              className={`gender-btn ${form.voiceGender === 'male' ? 'active' : ''}`}
              onClick={() => onUpdateField('voiceGender', 'male')}
            >
              👨 Erkek Sesi (Tok & Güven Verici - Puck)
            </button>
            <button
              type="button"
              className={`gender-btn ${form.voiceGender === 'female' || !form.voiceGender ? 'active' : ''}`}
              onClick={() => onUpdateField('voiceGender', 'female')}
            >
              👩 Kadın Sesi (Doğal & Akıcı Anlatıcı - Kore)
            </button>
          </div>
        </>
      )}

      {/* 14. ADIM: FON MÜZİĞİ VE SES TASARIMI */}
      <div style={{ marginTop: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span>🎵 14. Adım: Profesyonel Fon Müziği & Soundtrack (11 Tarz)</span>
          <span className="label-hint">Ducking: Konuşurken kısılır (%10), durunca yükselir (%28)</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
          {BG_MUSIC_OPTIONS.map(opt => {
            const currentMusic = form.bgMusic || 'auto';
            const isSelected = currentMusic === opt.id;
            const isPreviewing = previewingTrackId === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => onUpdateField('bgMusic', opt.id)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  textAlign: 'left',
                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid var(--line)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--card-bg, rgba(255,255,255,0.02))',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? '#38bdf8' : 'var(--txt)' }}>
                    {opt.label}
                  </div>
                  {opt.path && (
                    <button
                      type="button"
                      title={isPreviewing ? 'Durdur' : 'Parçayı Dinle (Önizleme)'}
                      onClick={e => {
                        e.stopPropagation();
                        if (isPreviewing) {
                          audioMgr.stopPreview();
                          setPreviewingTrackId(null);
                        } else {
                          setPreviewingTrackId(opt.id);
                          audioMgr.previewSoundtrack(opt.path, () => setPreviewingTrackId(null));
                        }
                      }}
                      style={{
                        background: isPreviewing ? '#ef4444' : 'rgba(56, 189, 248, 0.2)',
                        border: 'none',
                        color: isPreviewing ? '#fff' : '#38bdf8',
                        borderRadius: 6,
                        padding: '3px 7px',
                        fontSize: 11,
                        cursor: 'pointer',
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    >
                      {isPreviewing ? '⏹️ Dur' : '▶ Dinle'}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 3, lineHeight: 1.3 }}>
                  {opt.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* 13. ADIM: DUDAK SENKRONİZASYONU (LIP-SYNC) */}
      <div
        style={{
          marginTop: 14,
          padding: '12px 14px',
          background: form.enableLipSync ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${form.enableLipSync ? 'rgba(244, 63, 94, 0.4)' : 'var(--line)'}`,
          borderRadius: 10
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>👄</span>
            <div>
              <strong style={{ color: 'var(--txt)', fontSize: 13 }}>
                13. Adım: Dudak Senkronizasyonu & Konuşan Karakterler (Lip-Sync AI)
              </strong>
              <div style={{ color: 'var(--mute)', fontSize: 11.5 }}>
                Karakterlerin dudakları, çenesi ve yüz hareketleri Gemini stüdyo seslendirmesine birebir uyumlu hareket eder.
              </div>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0 }}>
            <input
              type="checkbox"
              checked={!!form.enableLipSync}
              onChange={e => onUpdateField('enableLipSync', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#f43f5e', cursor: 'pointer' }}
            />
            <span style={{ color: form.enableLipSync ? '#f43f5e' : 'var(--mute)', fontSize: 12, fontWeight: 600 }}>
              {form.enableLipSync ? '✓ Dudak Senkronu Açık' : 'Dudak Senkronunu Aç'}
            </span>
          </label>
        </div>
      </div>

      {/* TEKNİK AYARLAR: SÜRE, BOYUT, DİL */}
      <div className="row-3" style={{ marginTop: 14 }}>
        <div>
          <label htmlFor="input-dur">Süre (sn)</label>
          <input
            id="input-dur"
            type="number"
            min={5}
            max={300}
            value={form.dur}
            onChange={e => onUpdateField('dur', +e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="select-ratio">Video Boyutu</label>
          <select
            id="select-ratio"
            value={form.ratio}
            onChange={e => onUpdateField('ratio', e.target.value as AspectRatio)}
          >
            {Object.keys(RATIOS).map(r => (
              <option key={r} value={r}>
                {r === '21:9'
                  ? 'Sinematik Geniş (21:9 Cinemascope)'
                  : r === '16:9'
                    ? 'Yatay Standart (16:9 YouTube)'
                    : r === '9:16'
                      ? 'Dikey (9:16 Reels / Shorts)'
                      : 'Kare (1:1 Post)'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="select-lang">Ses Dili</label>
          <select
            id="select-lang"
            value={form.lang}
            onChange={e => onUpdateField('lang', e.target.value)}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {formError && (
        <div
          id="form-error-msg"
          style={{
            color: 'var(--err)',
            background: 'var(--err-bg)',
            padding: '10px 14px',
            borderRadius: 9,
            marginTop: 14,
            fontSize: 13,
            fontWeight: 500
          }}
        >
          ⚠ {formError}
        </div>
      )}

      {/* İki Aşamalı Üretim Seçenekleri */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {/* 1. Seçenek: Storyboard Sahne Tasarımcısı */}
        <button
          id="btn-produce-storyboard"
          type="button"
          className="btn-produce"
          disabled={isProducing}
          onClick={onSubmitStoryboard || onSubmit}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '13px 16px',
            fontSize: 14.5,
            fontWeight: 700
          }}
        >
          {isProducing ? '⏳ Senaryo & Sahneler Tasarlanıyor...' : '🎨 1. Sahneleri Tasarla (Storyboard Modu)'}
        </button>
        <div style={{ fontSize: 11.5, color: 'var(--mute)', textAlign: 'center', marginTop: -4 }}>
          💡 AI senaryoyu ve film karelerini hazırlar; render etmeden önce her sahneyi düzenleyebilirsiniz.
        </div>

        {/* 2. Seçenek: Hızlı Doğrudan Üretim */}
        <button
          id="btn-produce"
          type="button"
          className={`btn-produce ${isCinema
              ? 'btn-produce-cinema'
              : isDocumentary
                ? 'btn-produce-documentary'
                : isYouTube
                  ? 'btn-produce-youtube'
                  : ''
            }`}
          disabled={isProducing}
          onClick={onSubmit}
          style={{
            padding: '11px 14px',
            fontSize: 13.5,
            opacity: 0.95
          }}
        >
          {isProducing
            ? isCinema
              ? '⏳ Gemini AI Sinema Filmini Kurguluyor...'
              : isDocumentary
                ? '⏳ Gemini AI Belgeseli Kurguluyor...'
                : isYouTube
                  ? '⏳ Gemini AI YouTube Videosunu Hazırlıyor...'
                  : '⏳ Video Oluşturuluyor...'
            : isCinema
              ? '⚡ Hızlı Üret (Doğrudan Sinema Filmi Render Et)'
              : isDocumentary
                ? '⚡ Hızlı Üret (Doğrudan Belgesel Render Et)'
                : isYouTube
                  ? '⚡ Hızlı Üret (Doğrudan YouTube Videosu Render Et)'
                  : isClassic
                    ? '⚡ Hızlı Klasik Video Üret'
                    : '⚡ Hızlı AI Reklamı Üret'}
        </button>
      </div>
    </section>
  );
}
