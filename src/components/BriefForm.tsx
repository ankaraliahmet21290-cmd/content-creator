'use client';

import { BriefForm as IBriefForm, Preset, VideoType, AspectRatio, AppMode } from '@/types';
import { TYPES, TONES, RATIOS, PLATFORMS, LANGUAGES, PRESETS } from '@/lib/constants';

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
          {isCinema ? '21:9 Cinemascope' : isDocumentary ? '16:9 Belgesel' : isYouTube ? '16:9 Full HD' : isClassic ? 'Kural Şablonu' : 'Gemini 2.5 AI'}
        </span>
      </div>

      {/* Aktif Mod Açıklama Kartı */}
      <div className={`mode-banner ${isCinema ? 'cinema-banner' : isDocumentary ? 'documentary-banner' : isYouTube ? 'youtube-banner' : isClassic ? 'classic-banner' : 'ai-banner'}`}>
        {isCinema ? (
          <div>
            <strong>🎬 Sinema Modu:</strong> 21:9 Cinemascope geniş ekran formatında Hollywood 3-Perde film kurgusu, replikler, anamorfik sahne planlaması ve tok seslendirme ile sinematik fragman/film üretir.
          </div>
        ) : isDocumentary ? (
          <div>
            <strong>🎙️ Belgesel Modu:</strong> BBC Earth ve National Geographic standartlarında araştırma kurgusu, kilit kanıtlar, tarihi/bilimsel analiz ve usta anlatıcı sesiyle büyüleyici bir belgesel üretir.
          </div>
        ) : isYouTube ? (
          <div>
            <strong>🔴 YouTube Modu:</strong> 16:9 Full HD formatında ilk 5 saniye kancası, retention (izleyici tutma) akışı, görsel grafikler ve abone ol çağrısıyla tam YouTube videosu üretir.
          </div>
        ) : isClassic ? (
          <div>
            <strong>⚡ Klasik Mod:</strong> Standart SOP kural şablonları üzerinden anında senaryo üretir.
          </div>
        ) : (
          <div>
            <strong>✨ AI Reklam Modu:</strong> Ürün ve kampanya talimatınızı yazın; Gemini hedef kitleyi, çarpıcı kancayı ve çağrıyı (CTA) otomatik oluştursun.
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
        <div className="ai-instructions-box" style={{ marginTop: 12 }}>
          <label htmlFor="ai-instructions" style={{ fontSize: 13.5 }}>
            {form.type === 'sinema'
              ? '✨ Film Hikâyesi, Karakterler & Yönetmen Talimatı'
              : form.type === 'belgesel'
              ? '✨ Belgesel Konusu, Araştırma Notları & Yönetmen Talimatı'
              : form.type === 'youtube'
              ? '✨ YouTube Video Talimatı & İşlenecek Konular'
              : '✨ Reklam Talimatı & Senaryo Özeti'}
            <span className="label-hint">
              {form.type === 'sinema'
                ? '(Atmosfer, karakter replikleri, gerilim, kamera hareketleri)'
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
                ? 'Örn: 2088 yılında yapay zekanın kontrolündeki bir distopyada geçen bilim kurgu gerilim filmi. Baş karakter dedektif Kaan, karanlık neon ışıklı sokaklar, fütüristik araçlar ve insanlığın kaderini belirleyecek son şifre. Müzikal yükseliş, sinematik kamera açıları ve vizyon tarihi çağrısı...'
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
