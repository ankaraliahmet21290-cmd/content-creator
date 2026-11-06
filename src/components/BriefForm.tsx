'use client';

import { BriefForm as IBriefForm, Preset, VideoType, AspectRatio, AppMode, CharacterProfile } from '@/types';
import { TYPES, TONES, RATIOS, PLATFORMS, LANGUAGES, PRESETS, BG_MUSIC_OPTIONS, CHARACTER_PRESETS } from '@/lib/constants';

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
  const isClassic = mode === 'classic';
  const isCinema = mode === 'sinema' || form.type === 'sinema';
  const isDocumentary = mode === 'belgesel' || form.type === 'belgesel';
  const isYouTube = mode === 'youtube' || form.type === 'youtube';
  const isAi = !isClassic;

  const character = form.character || CHARACTER_PRESETS[0];
  const isCharEnabled = !!form.character?.enabled;

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
            : isClassic
            ? '⚡ Klasik Video Brief\'i'
            : '✨ Yapay Zekâ Reklam Stüdyosu'}
        </h2>
        <span className={`badge ${isCinema ? 'badge-cinema' : isDocumentary ? 'badge-documentary' : isYouTube ? 'badge-youtube' : isClassic ? 'sop' : 'badge-ai'}`}>
          {isCinema ? '21:9 Cinemascope' : isDocumentary ? '16:9 Belgesel' : isYouTube ? '16:9 Full HD' : isClassic ? 'Kural Şablonu' : 'Gemini 3.6 AI'}
        </span>
      </div>

      {/* Aktif Mod Açıklama Kartı */}
      <div className={`mode-banner ${isCinema ? 'cinema-banner' : isDocumentary ? 'documentary-banner' : isYouTube ? 'youtube-banner' : isClassic ? 'classic-banner' : 'ai-banner'}`}>
        {isCinema ? (
          <div>
            <strong>🎬 Yapay Zekâ Sinema Modu:</strong> 21:9 Cinemascope Hollywood 3-Perde kurgusu, <strong>Flux AI fotogerçekçi 35mm film sahneleri</strong> ve <strong>Gemini 24kHz stüdyo seslendirmesi</strong> ile gerçek bir sinema filmi fragmanı üretir.
          </div>
        ) : isDocumentary ? (
          <div>
            <strong>🎙️ Yapay Zekâ Belgesel Modu:</strong> BBC Earth & National Geographic standartlarında araştırma kurgusu, <strong>fotogerçekçi belgesel kareleri</strong> ve <strong>Gemini bilge anlatıcı seslendirmesi</strong> ile derinlikli bir yapım hazırlar.
          </div>
        ) : isYouTube ? (
          <div>
            <strong>🔴 Yapay Zekâ YouTube Modu:</strong> 16:9 Full HD formatında ilk 5 saniye kancası, retention akışı, <strong>gerçekçi stüdyo kareleri</strong> ve <strong>enerjik AI seslendirmesi</strong> sunar.
          </div>
        ) : isClassic ? (
          <div>
            <strong>⚡ Klasik Mod:</strong> Standart SOP kural şablonları üzerinden anında senaryo üretir.
          </div>
        ) : (
          <div>
            <strong>✨ Yapay Zekâ Reklam Modu:</strong> <strong>Fotogerçekçi ticari film sahneleri</strong> ve <strong>Gemini stüdyo seslendirmesi</strong> ile yüksek dönüşümlü reklam filmi üretir.
          </div>
        )}
      </div>

      {/* Hızlı Şablonlar */}
      <label>
        Hızlı İlham Şablonları
        <span className="label-hint">(Tek tıkla doldur)</span>
      </label>
      <div className="presets">
        {PRESETS.map((p, i) => (
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

      {/* Hızlı Yapım Türü Seçici */}
      <label style={{ marginTop: 12 }}>
        🎬 Video & Yapım Türü
        <span className="label-hint">(Sinema, Belgesel, YouTube veya Sosyal Medya)</span>
      </label>
      <div className="format-pills">
        <button
          type="button"
          className={`format-pill ${form.type === 'sinema' ? 'active' : ''}`}
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
          className={`format-pill ${form.type === 'belgesel' ? 'active' : ''}`}
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
          className={`format-pill ${form.type === 'youtube' ? 'active' : ''}`}
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
          className={`format-pill ${form.type === 'reklam' || form.type === 'tanitim' ? 'active' : ''}`}
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
          className={`format-pill ${form.type === 'sosyal' ? 'active' : ''}`}
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

      {/* 1. ALAN: Ürün veya Marka Adı */}
      <label htmlFor="input-product" style={{ marginTop: 12 }}>
        {form.type === 'sinema'
          ? 'Film, Fragman veya Eser Adı *'
          : form.type === 'belgesel'
          ? 'Belgesel, Keşif veya Araştırma Başlığı *'
          : form.type === 'youtube'
          ? 'YouTube Video Başlığı veya Konusu *'
          : 'Ürün, Marka veya Konu Adı *'}
      </label>
      <input
        id="input-product"
        value={form.product}
        placeholder={
          form.type === 'sinema'
            ? 'Örn: 2088: Son Şafak (The Last Dawn) veya Zamanın Ötesi'
            : form.type === 'belgesel'
            ? 'Örn: Gize Piramitlerinin Gizemi veya Okyanusun Karanlık Derinlikleri'
            : form.type === 'youtube'
            ? 'Örn: Yapay Zekâ Sinema Sektörünü Nasıl Değiştiriyor? veya 2026 AI Donanımları'
            : 'Örn: Korkmaz Gayrimenkul Lüks Rezidans veya Artisan Kahve'
        }
        onChange={e => onUpdateField('product', e.target.value)}
      />

      {/* YAPAY ZEKÂ MODU: TEK VE GÜÇLÜ TALİMAT ALANI */}
      {isAi ? (
        <>
          <div className="ai-instructions-box" style={{ marginTop: 12 }}>
          <label htmlFor="ai-instructions" style={{ fontSize: 13.5 }}>
            {form.type === 'sinema'
              ? '✨ Film Hikâyesi, Hazır Senaryo Metni & Karakter Replikleri'
              : form.type === 'belgesel'
              ? '✨ Belgesel Konusu, Araştırma Notları & Yönetmen Talimatı'
              : form.type === 'youtube'
              ? '✨ YouTube Video Talimatı & İşlenecek Konular'
              : '✨ Reklam Talimatı & Senaryo Özeti'}
            <span className="label-hint">
              {form.type === 'sinema'
                ? '(Hazır senaryonuzu veya diyaloglarınızı doğrudan yapıştırabilirsiniz)'
                : form.type === 'belgesel'
                ? '(Kanca soru, tarihi belgeler, saha keşifleri, bilimsel kanıtlar)'
                : form.type === 'youtube'
                ? '(Retention kancası, ana argümanlar, B-roll, abone olma çağrısı)'
                : '(Hedef kitle, öne çıkanlar, ton veya CTA)'}
            </span>
          </label>
          <textarea
            id="ai-instructions"
            value={form.customInstructions || ''}
            placeholder={
              form.type === 'sinema'
                ? `İster hazır senaryonuzu veya sahne diyaloglarınızı doğrudan buraya yapıştırın, ister film fikrinizi anlatın:
Örn hazır senaryo:
Sahne 1 (Dış Ses - Erkek): "2088 yılında İstanbul derin bir karanlığa gömülmüştü..."
Sahne 2 (Ajan Selin - Kadın): "Sinyali tespit ettik komutanım, zamanımız tükeniyor!"
Sahne 3 (Komutan Demir - Erkek): "Operasyonu hemen başlatın, geri dönüş yok!"
Sahne 4 (Dış Ses): "Nefes kesen bir macera... Çok yakında sinemalarda!"`
                : form.type === 'belgesel'
                ? 'Örn: Mısır piramitlerinin astronomik dizilimi ve derinliklerindeki gizli odalar hakkında merak uyandıran bir belgesel kurgula. Sisli çöl gün doğumu drone çekimleri, hiyerogliflerin şifresi, modern jeoradar keşifleri ve tarihin bilinmeyen yönlerini anlatan bilge, usta bir anlatıcı tonu...'
                : form.type === 'youtube'
                ? 'Örn: Yapay zekanın sinema sektörünü nasıl kökten değiştirdiğini anlatan sürükleyici bir YouTube belgeseli. İzleyiciyi ilk 5 saniyede ekrana kitleyen bir kanca, Hollywood\'dan örnekler, B-roll önerileri ve sonunda kanala abone olma & yorum yapma çağrısı...'
                : 'Örn: Genç aileleri ve yatırımcıları hedefle. Deniz manzarası, akıllı ev konforu ve %20 peşinat indirimini vurgula. Reklam çok enerjik olsun, sonunda hemen arayın desin...'
            }
            rows={5}
            onChange={e => onUpdateField('customInstructions', e.target.value)}
          />
        </div>

        {/* 3. & 8. ADIM: KARAKTER TASARIMI VE SAHNE TUTARLILIĞI (CONSISTENT CHARACTER) */}
        <div
          style={{
            marginTop: 16,
            padding: '14px 16px',
            background: isCharEnabled ? 'rgba(217, 70, 239, 0.06)' : 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${isCharEnabled ? 'rgba(217, 70, 239, 0.35)' : 'var(--line)'}`,
            borderRadius: 12,
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>🎭</span>
              <div>
                <strong style={{ color: 'var(--txt)', fontSize: 13.5 }}>
                  3. & 8. Adım: Tutarlı Karakter Tasarımı (Consistent Character)
                </strong>
                <div style={{ color: 'var(--mute)', fontSize: 12 }}>
                  Tüm film sahnelerinde başrolün yüzü, saçı ve kostümü sabit kalarak tutarlılık sağlanır.
                </div>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0, fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isCharEnabled}
                onChange={e => handleToggleCharacter(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#d946ef', cursor: 'pointer' }}
              />
              <span style={{ color: isCharEnabled ? '#d946ef' : 'var(--mute)', fontSize: 13 }}>
                {isCharEnabled ? '✓ Karakter Aktif' : 'Karakter Sabitle'}
              </span>
            </label>
          </div>

          {isCharEnabled && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(217, 70, 239, 0.15)' }}>
              <label style={{ fontSize: 12, color: 'var(--mute)', marginBottom: 6 }}>
                Hızlı Karakter Şablonu Seç
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {CHARACTER_PRESETS.map((cp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCharacterPreset(cp)}
                    className="preset-chip"
                    style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      borderColor: character.name === cp.name ? '#d946ef' : undefined,
                      background: character.name === cp.name ? 'rgba(217, 70, 239, 0.2)' : undefined,
                      color: character.name === cp.name ? '#ffffff' : undefined
                    }}
                  >
                    {cp.gender === 'male' ? '👨' : '👩'} {cp.name} ({cp.roleArchetype})
                  </button>
                ))}
              </div>

              <div className="row-3" style={{ marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 12 }}>Karakter Adı</label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={e => handleUpdateCharacter('name', e.target.value)}
                    placeholder="Örn: Kaan Kaya"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12 }}>Cinsiyet & Ses</label>
                  <select
                    value={character.gender}
                    onChange={e => handleUpdateCharacter('gender', e.target.value as 'male' | 'female')}
                  >
                    <option value="male">👨 Erkek (Puck Sesi)</option>
                    <option value="female">👩 Kadın (Kore Sesi)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12 }}>Yaş Grubu</label>
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

              <div className="row" style={{ marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 12 }}>Fiziksel Özellikler (Yüz, Saç, İfade)</label>
                  <input
                    type="text"
                    value={character.appearance}
                    onChange={e => handleUpdateCharacter('appearance', e.target.value)}
                    placeholder="Örn: keskin çene hattı, kısa siyah saç, kararlı bakış"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12 }}>Kostüm & Kıyafet (Sabit)</label>
                  <input
                    type="text"
                    value={character.clothing}
                    onChange={e => handleUpdateCharacter('clothing', e.target.value)}
                    placeholder="Örn: siyah trençkot ve balıkçı kazak"
                  />
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--mute)' }}>
                  🔑 Yapay Zekâ Görsel Tutarlılık Promptu (Consistency Seed)
                </label>
                <input
                  type="text"
                  value={character.consistencyPrompt}
                  onChange={e => handleUpdateCharacter('consistencyPrompt', e.target.value)}
                  style={{ fontSize: 11, fontFamily: 'monospace', color: '#d946ef' }}
                />
              </div>
            </div>
          )}
        </div>
        </>
      ) : (
        /* KLASİK MOD: ESKİ AYRI AYRI KUTUCUKLAR */
        <>
          <label>Video Türü</label>
          <div className="types-grid">
            {(Object.entries(TYPES) as [VideoType, string][]).map(([k, v]) => (
              <button
                key={k}
                type="button"
                className="type-btn"
                aria-pressed={form.type === k}
                onClick={() => onUpdateField('type', k)}
              >
                {v}
              </button>
            ))}
          </div>

          <label htmlFor="input-audience">Hedef Kitle</label>
          <input
            id="input-audience"
            value={form.audience}
            placeholder="Örn. Yatırımcılar, aileler, gençler"
            onChange={e => onUpdateField('audience', e.target.value)}
          />

          <label htmlFor="textarea-points">
            Öne Çıkan Noktalar
            <span className="label-hint">(Her satıra bir özellik)</span>
          </label>
          <textarea
            id="textarea-points"
            value={form.points}
            placeholder={'Merkezi konum ve deniz manzarası\nAkıllı ev altyapısı\nÖzel lansman indirimi'}
            rows={3}
            onChange={e => onUpdateField('points', e.target.value)}
          />

          <label htmlFor="input-cta">Son Çağrı (Call to Action / CTA)</label>
          <input
            id="input-cta"
            value={form.cta}
            placeholder="Örn. Detaylı bilgi için hemen arayın!"
            onChange={e => onUpdateField('cta', e.target.value)}
          />

          <div className="row">
            <div>
              <label htmlFor="select-tone">Anlatım Tonu</label>
              <select
                id="select-tone"
                value={form.tone}
                onChange={e => onUpdateField('tone', e.target.value)}
              >
                {TONES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="select-platform-classic">Platform</label>
              <select
                id="select-platform-classic"
                value={form.platform}
                onChange={e => onUpdateField('platform', e.target.value)}
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* SESLENDİRME AYARI: SİNEMADA ÇOKLU OYUNCU KADROSU / DİĞER MODLARDA SES SEÇİMİ */}
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
              Sinema modunda sahnelerde birden fazla kadın ve erkek karakter konuşabilir. Senaryodaki diyaloğa göre uygun kadın (<em>Kore</em>) veya erkek (<em>Puck</em>) sesi her sahneye otomatik atanır; Storyboard masasında her karakteri dilediğiniz gibi düzenleyebilirsiniz.
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

      {/* 14. ADIM: SİNEMATİK FON MÜZİĞİ VE SES TASARIMI (SOUNDTRACK) */}
      <div style={{ marginTop: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span>🎵 14. Adım: Sinematik Fon Müziği & Soundtrack</span>
          <span className="label-hint">Ducking: Konuşurken kısılır (%12), durunca yükselir (%28)</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {BG_MUSIC_OPTIONS.map(opt => {
            const currentMusic = form.bgMusic || (isCinema || isDocumentary ? 'cinema_epic' : isYouTube ? 'youtube_lofi' : 'sales_corporate');
            const isSelected = currentMusic === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateField('bgMusic', opt.id)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  textAlign: 'left',
                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid var(--line)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--card-bg, rgba(255,255,255,0.02))',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? '#38bdf8' : 'var(--txt)' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2, lineHeight: 1.3 }}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
          className={`btn-produce ${isCinema ? 'btn-produce-cinema' : isDocumentary ? 'btn-produce-documentary' : isYouTube ? 'btn-produce-youtube' : ''}`}
          disabled={isProducing}
          onClick={onSubmit}
          style={{
            padding: '11px 14px',
            fontSize: 13.5,
            opacity: 0.95
          }}
        >
          {isProducing
            ? (isCinema
                ? '⏳ Gemini AI Sinema Filmini Kurguluyor...'
                : isDocumentary
                ? '⏳ Gemini AI Belgeseli Kurguluyor...'
                : isYouTube
                ? '⏳ Gemini AI YouTube Videosunu Hazırlıyor...'
                : '⏳ Video Oluşturuluyor...')
            : (isCinema
                ? '⚡ Hızlı Üret (Doğrudan Sinema Filmi Render Et)'
                : isDocumentary
                ? '⚡ Hızlı Üret (Doğrudan Belgesel Render Et)'
                : isYouTube
                ? '⚡ Hızlı Üret (Doğrudan YouTube Videosu Render Et)'
                : isClassic
                ? '⚡ Hızlı Klasik Video Üret'
                : '⚡ Hızlı AI Reklamı Üret')}
        </button>
      </div>
    </section>
  );
}
