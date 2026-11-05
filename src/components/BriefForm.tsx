'use client';

import { BriefForm as IBriefForm, Preset, VideoType, AspectRatio } from '@/types';
import { TYPES, TONES, RATIOS, PLATFORMS, LANGUAGES, PRESETS } from '@/lib/constants';

interface BriefFormProps {
  form: IBriefForm;
  mode: 'ai' | 'classic';
  isProducing: boolean;
  formError: string;
  onUpdateField: <K extends keyof IBriefForm>(field: K, value: IBriefForm[K]) => void;
  onSelectPreset: (preset: Preset) => void;
  onSubmit: () => void;
}

export function BriefForm({
  form,
  mode,
  isProducing,
  formError,
  onUpdateField,
  onSelectPreset,
  onSubmit
}: BriefFormProps) {
  const isAi = mode === 'ai';

  return (
    <section className="panel" aria-labelledby="brief-section-title">
      <div className="panel-hdr">
        <h2 id="brief-section-title">
          {isAi ? '✨ Yapay Zekâ Video Stüdyosu' : '⚡ Klasik Video Brief\'i'}
        </h2>
        <span className={`badge ${isAi ? 'badge-ai' : ''}`}>
          {isAi ? 'Gemini 2.5 AI' : 'Kural Şablonu'}
        </span>
      </div>

      {/* Aktif Mod Açıklama Kartı */}
      <div className={`mode-banner ${isAi ? 'ai-banner' : 'classic-banner'}`}>
        {isAi ? (
          <div>
            <strong>✨ Tek Kutudan AI Video Üretimi:</strong> Ürün adını ve reklam talimatınızı yazın; Gemini hedef kitleyi, çarpıcı kancayı, sahne kurgusunu ve çağrıyı (CTA) otomatik oluştursun.
          </div>
        ) : (
          <div>
            <strong>⚡ Klasik Mod:</strong> Standart SOP kural şablonları üzerinden anında senaryo üretir.
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
        <span className="label-hint">(Sinema, YouTube veya Sosyal Medya)</span>
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
            if (form.dur < 30) onUpdateField('dur', 45);
          }}
        >
          🎬 Sinema Filmi & Fragman
        </button>
        <button
          type="button"
          className={`format-pill ${form.type === 'youtube' ? 'active' : ''}`}
          onClick={() => {
            onUpdateField('type', 'youtube');
            onUpdateField('ratio', '16:9');
            onUpdateField('tone', 'YouTube Dinamik & Sürükleyici');
            onUpdateField('platform', 'YouTube (Yatay 16:9)');
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
            : form.type === 'youtube'
            ? 'Örn: Yapay Zekâ Sinema Sektörünü Nasıl Değiştiriyor? veya 2026 AI Donanımları'
            : 'Örn: Korkmaz Gayrimenkul Lüks Rezidans veya Artisan Kahve'
        }
        onChange={e => onUpdateField('product', e.target.value)}
      />

      {/* YAPAY ZEKÂ MODU: TEK VE GÜÇLÜ TALİMAT ALANI */}
      {isAi ? (
        <div className="ai-instructions-box" style={{ marginTop: 12 }}>
          <label htmlFor="ai-instructions" style={{ fontSize: 13.5 }}>
            {form.type === 'sinema'
              ? '✨ Film Hikâyesi, Karakterler & Sahne Notları'
              : form.type === 'youtube'
              ? '✨ YouTube Video Talimatı & İşlenecek Konular'
              : '✨ Reklam Talimatı & Senaryo Özeti'}
            <span className="label-hint">
              {form.type === 'sinema'
                ? '(Atmosfer, karakter replikleri, gerilim, kamera hareketleri)'
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
                ? 'Örn: 2088 yılında yapay zekanın kontrolündeki bir distopyada geçen bilim kurgu gerilim filmi. Baş karakter dedektif Kaan, karanlık neon ışıklı sokaklar, fütüristik araçlar ve insanlığın kaderini belirleyecek son şifre. Müzikal yükseliş, sinematik kamera açıları ve vizyon tarihi çağrısı...'
                : form.type === 'youtube'
                ? 'Örn: Yapay zekanın sinema sektörünü nasıl kökten değiştirdiğini anlatan sürükleyici bir YouTube belgeseli. İzleyiciyi ilk 5 saniyede ekrana kitleyen bir kanca, Hollywood\'dan örnekler, B-roll önerileri ve sonunda kanala abone olma & yorum yapma çağrısı...'
                : 'Örn: Genç aileleri ve yatırımcıları hedefle. Deniz manzarası, akıllı ev konforu ve %20 peşinat indirimini vurgula. Reklam çok enerjik olsun, sonunda hemen arayın desin...'
            }
            rows={5}
            onChange={e => onUpdateField('customInstructions', e.target.value)}
          />
        </div>
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

      {/* ORTAK TEMEL AYARLAR: SES CİNSİYETİ, SÜRE VE EN-BOY ORANI */}
      <label style={{ marginTop: 14 }}>Seslendirme Karakteri</label>
      <div className="gender-toggle-group">
        <button
          type="button"
          className={`gender-btn ${form.voiceGender === 'female' || !form.voiceGender ? 'active' : ''}`}
          onClick={() => onUpdateField('voiceGender', 'female')}
        >
          👩 Kadın Sesi (Akıcı & Samimi)
        </button>
        <button
          type="button"
          className={`gender-btn ${form.voiceGender === 'male' ? 'active' : ''}`}
          onClick={() => onUpdateField('voiceGender', 'male')}
        >
          👨 Erkek Sesi (Güven Verici & Tok)
        </button>
      </div>

      <div className="row-3" style={{ marginTop: 8 }}>
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

      {/* Üretim Butonu */}
      <button
        id="btn-produce"
        type="button"
        className="btn-produce"
        disabled={isProducing}
        onClick={onSubmit}
        style={{ marginTop: 18 }}
      >
        {isProducing
          ? (isAi ? '⏳ Gemini AI Video & Film Üretiyor...' : '⏳ Video Oluşturuluyor...')
          : (isAi ? '✨ Tek Tıkla AI Video & Film Üret' : '⚡ Klasik Video Üret')}
      </button>
    </section>
  );
}
