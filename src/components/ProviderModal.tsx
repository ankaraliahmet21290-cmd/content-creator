'use client';

import { useState } from 'react';
import { ProviderConfig } from '@/types';
import { getSavedProviderConfig } from '@/lib/providers';

interface ProviderModalProps {
  onClose: () => void;
}

export function ProviderModal({ onClose }: ProviderModalProps) {
  const [config, setConfig] = useState<ProviderConfig>(() => getSavedProviderConfig());

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('klaket_provider_config', JSON.stringify(config));
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h3>AI Sağlayıcı ve Gemini API Ayarları (SOP Bölüm 5)</h3>
          <button type="button" className="btn sm" onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--mute)', margin: '0 0 16px', lineHeight: 1.6 }}>
          Uygulama varsayılan olarak sunucuda tanımlı <strong>Google Gemini API</strong> anahtarını kullanarak
          senaryo, vektörel sahne kompozisyonu ve 24kHz doğal seslendirme (TTS) üretir.
        </p>

        <label htmlFor="llm-select">Senaryo & Görsel Kompozisyon Sağlayıcısı (LLM)</label>
        <select
          id="llm-select"
          value={config.llm}
          onChange={e => setConfig({ ...config, llm: e.target.value })}
        >
          <option value="gemini">Google Gemini 2.5 Flash (Aktif AI Senaryo & Sahne Üretimi)</option>
          <option value="local">Yerel SOP Şablon Adaptörü (Çevrimdışı / Hızlı)</option>
        </select>

        <label htmlFor="tts-select">Seslendirme Sağlayıcısı (TTS)</label>
        <select
          id="tts-select"
          value={config.tts}
          onChange={e => setConfig({ ...config, tts: e.target.value })}
        >
          <option value="gemini_tts">Google Gemini AI TTS (24kHz Gerçekçi Seslendirme)</option>
          <option value="webspeech">Web Speech API (Tarayıcı İçi Yerel Seslendirme)</option>
        </select>

        <label htmlFor="voice-gender-select">Ses Cinsiyeti (AI & Tarayıcı TTS)</label>
        <select
          id="voice-gender-select"
          value={config.voiceGender || 'female'}
          onChange={e => setConfig({ ...config, voiceGender: e.target.value as 'female' | 'male' })}
        >
          <option value="female">Kadın Sesi (Doğal, Akıcı, Profesyonel)</option>
          <option value="male">Erkek Sesi (Kararlı, Güven Verici, Dinamik)</option>
        </select>

        {/* DUDAK SENKRONU VE AÇIK KAYNAK MOTOR */}
        <label htmlFor="lipsync-select">👄 Dudak Senkronu & Konuşan Yüz Motoru</label>
        <select
          id="lipsync-select"
          value={config.lipSyncEngine || 'local'}
          onChange={e => setConfig({ ...config, lipSyncEngine: e.target.value as 'local' | 'liveportrait' | 'sadtalker' | 'replicate' })}
        >
          <option value="local">Açık Kaynak Yerel Motor: Audio Viseme & Waveform (Ücretsiz, Sıfır Kota, Anında)</option>
          <option value="liveportrait">Açık Kaynak: LivePortrait (Açık Model - Yüz & Dudak Mimikleri)</option>
          <option value="sadtalker">Açık Kaynak: SadTalker (Açık Model - Konuşan İnsan Sentezi)</option>
          <option value="replicate">Bulut API: Replicate / Fal.ai Video Motoru</option>
        </select>

        <label htmlFor="gemini-key-input">
          Google AI Studio / Google One Premium API Anahtarı
        </label>
        <input
          id="gemini-key-input"
          type="password"
          value={config.geminiApiKey || ''}
          placeholder="AIzaSy... (Google One / AI Studio ücretsiz anahtarınız)"
          onChange={e => setConfig({ ...config, geminiApiKey: e.target.value })}
        />
        <div style={{ fontSize: 11.5, color: '#38bdf8', marginBottom: 10 }}>
          💡 Google One hesabınızla <strong>aistudio.google.com</strong> adresinden ücretsiz API anahtarı alabilirsiniz. Gemini 2.5/3.6, Imagen 3 ve Studio TTS için günlük 1.500 istek tamamen ücretsizdir.
        </div>

        <label htmlFor="hf-key-input">
          Hugging Face / Açık Kaynak API Token (İsteğe Bağlı)
        </label>
        <input
          id="hf-key-input"
          type="password"
          value={config.huggingFaceApiKey || ''}
          placeholder="hf_... (Boş bırakılırsa yerel motor kullanılır)"
          onChange={e => setConfig({ ...config, huggingFaceApiKey: e.target.value })}
        />

        <label htmlFor="render-select">Görsel / Video Render Motoru</label>
        <select
          id="render-select"
          value={config.renderEngine}
          onChange={e => setConfig({ ...config, renderEngine: e.target.value })}
        >
          <option value="canvas">HTML5 Canvas + AudioStream MediaRecorder (.webm / 1080p Full HD)</option>
          <option value="ffmpeg">Bulut FFmpeg / Worker Render Motoru</option>
        </select>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          <button type="button" className="btn" onClick={onClose}>
            İptal
          </button>
          <button type="button" className="btn primary" onClick={handleSave}>
            Kaydet ve Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
