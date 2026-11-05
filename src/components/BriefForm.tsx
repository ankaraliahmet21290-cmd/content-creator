'use client';

import { BriefForm as IBriefForm, Preset, VideoType, AspectRatio } from '@/types';
import { TYPES, TONES, RATIOS, PLATFORMS, LANGUAGES, PRESETS } from '@/lib/constants';

interface BriefFormProps {
  form: IBriefForm;
  isProducing: boolean;
  formError: string;
  onUpdateField: <K extends keyof IBriefForm>(field: K, value: IBriefForm[K]) => void;
  onSelectPreset: (preset: Preset) => void;
  onSubmit: () => void;
}

export function BriefForm({
  form,
  isProducing,
  formError,
  onUpdateField,
  onSelectPreset,
  onSubmit
}: BriefFormProps) {
  return (
    <section className="panel" aria-labelledby="brief-section-title">
      <div className="panel-hdr">
        <h2 id="brief-section-title">Video Brief&apos;i</h2>
        <span className="badge">Adım 1 / 5</span>
      </div>

      {/* Hazır Şablonlar */}
      <label>
        Hızlı Şablonlar
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

      {/* Video Türü */}
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

      {/* Ürün / Konu Adı */}
      <label htmlFor="input-product">Ürün veya Konu Adı *</label>
      <input
        id="input-product"
        value={form.product}
        placeholder="Örn. Korkmaz Gayrimenkul Lüks Rezidans"
        onChange={e => onUpdateField('product', e.target.value)}
      />

      {/* Hedef Kitle */}
      <label htmlFor="input-audience">Hedef Kitle</label>
      <input
        id="input-audience"
        value={form.audience}
        placeholder="Örn. Yatırımcılar, aileler, genç profesyoneller"
        onChange={e => onUpdateField('audience', e.target.value)}
      />

      {/* Öne Çıkan Noktalar */}
      <label htmlFor="textarea-points">
        Öne Çıkan Noktalar
        <span className="label-hint">(Her satıra bir özellik)</span>
      </label>
      <textarea
        id="textarea-points"
        value={form.points}
        placeholder={'Merkezi konum ve deniz manzarası\nAkıllı ev altyapısı ve kapalı otopark\nÖzel lansman indirimi'}
        rows={3}
        onChange={e => onUpdateField('points', e.target.value)}
      />

      {/* CTA */}
      <label htmlFor="input-cta">Son Çağrı (Call to Action / CTA)</label>
      <input
        id="input-cta"
        value={form.cta}
        placeholder="Örn. Detaylı bilgi için hemen arayın!"
        onChange={e => onUpdateField('cta', e.target.value)}
      />

      {/* Anlatım Tonu & Dil */}
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
          <label htmlFor="select-lang">Ses & Altyazı Dili</label>
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

      {/* Süre, Oran & Platform */}
      <div className="row-3">
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
          <label htmlFor="select-ratio">Oran</label>
          <select
            id="select-ratio"
            value={form.ratio}
            onChange={e => onUpdateField('ratio', e.target.value as AspectRatio)}
          >
            {Object.keys(RATIOS).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="select-platform">Platform</label>
          <select
            id="select-platform"
            value={form.platform}
            onChange={e => onUpdateField('platform', e.target.value)}
          >
            {PLATFORMS.map(p => (
              <option key={p} value={p}>{p}</option>
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
      >
        {isProducing ? '⏳ SOP Akışı Çalıştırılıyor...' : '🚀 SOP ile Video Üret'}
      </button>
    </section>
  );
}
