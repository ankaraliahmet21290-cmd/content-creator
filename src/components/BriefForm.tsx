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

      {/* 1. ALAN: Ürün veya Marka Adı */}
      <label htmlFor="input-product">Ürün, Marka veya Konu Adı *</label>
      <input
        id="input-product"
        value={form.product}
        placeholder="Örn. Korkmaz Gayrimenkul Lüks Rezidans veya Artisan Kahve"
        onChange={e => onUpdateField('product', e.target.value)}
      />

      {/* YAPAY ZEKÂ MODU: TEK VE GÜÇLÜ TALİMAT ALANI */}
      {isAi ? (
        <div className="ai-instructions-box" style={{ marginTop: 12 }}>
          <label htmlFor="ai-instructions" style={{ fontSize: 13.5 }}>
            ✨ Reklam Talimatı & Senaryo Özeti
            <span className="label-hint">(Hedef kitle, öne çıkanlar, ton veya CTA)</span>
          </label>
          <textarea
            id="ai-instructions"
            value={form.customInstructions || ''}
            placeholder="Örn: Genç aileleri ve yatırımcıları hedefle. Deniz manzarası, akıllı ev konforu ve %20 peşinat indirimini vurgula. Reklam çok enerjik olsun, sonunda hemen arayın desin..."
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
            max={120}
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
                {r === '9:16' ? 'Dikey (9:16 Reels/TikTok)' : r === '16:9' ? 'Yatay (16:9 YouTube)' : 'Kare (1:1 Post)'}
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
          ? (isAi ? '⏳ Gemini AI Reklamı Oluşturuyor...' : '⏳ Video Oluşturuluyor...')
          : (isAi ? '✨ Tek Tıkla AI Reklamı Üret' : '⚡ Klasik Video Üret')}
      </button>
    </section>
  );
}
