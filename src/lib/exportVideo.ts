'use client';

import { resolveBgmTrackPath } from './constants';
import { VideoItem } from '@/types';
import { sleep } from './providers';

function loadImage(src?: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function loadVideoElement(src?: string): Promise<HTMLVideoElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise(resolve => {
    const vid = document.createElement('video');
    vid.crossOrigin = 'anonymous';
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.onloadeddata = () => {
      vid.play().catch(() => {});
      resolve(vid);
    };
    vid.onerror = () => resolve(null);
    vid.src = src;
  });
}

function loadAudioBuffer(audioCtx: AudioContext, url: string): Promise<AudioBuffer | null> {
  return fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .catch(() => null);
}

/**
 * korkmaz-gayrimenkul-tanitim-v5 kalitesinde 1080p sinematik render motoru
 */
export async function exportVideoFile(
  video: VideoItem,
  onProgress?: (percent: number, statusText: string) => void
): Promise<void> {
  let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'renderCanvas';
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
  }

  let w = 1920;
  let h = 1080;
  if (video.ratio === '21:9') {
    w = 1920;
    h = 822; // 21:9 Cinemascope (2.33:1 Widescreen)
  } else if (video.ratio === '16:9') {
    w = 1920;
    h = 1080; // 16:9 Full HD (YouTube standardı)
  } else if (video.ratio === '9:16') {
    w = 1080;
    h = 1920; // 9:16 Shorts / Reels
  } else if (video.ratio === '1:1') {
    w = 1080;
    h = 1080; // 1:1 Kare
  }
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context oluşturulamadı.');

  // Gerçek fotoğrafları ve dudak senkronlu video kliplerini önceden yükle
  const sceneImages = await Promise.all(video.scenes.map(sc => loadImage(sc.imageUrl)));
  const sceneVideos = await Promise.all(video.scenes.map(sc => loadVideoElement(sc.lipSyncVideoUrl)));

  // Ses sistemi: Satış fon müziği + Gemini AI seslendirmesini miksle
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const isCinema = video.type === 'sinema' || video.ratio === '21:9';
  const isDocumentary = video.type === 'belgesel';
  const isYouTube = video.type === 'youtube';

  const audioCtx = AudioCtx ? new AudioCtx() : null;
  if (audioCtx && audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  const audioDest = audioCtx ? audioCtx.createMediaStreamDestination() : null;
  const masterBus = audioCtx ? audioCtx.createGain() : null;
  const compressor = audioCtx ? audioCtx.createDynamicsCompressor() : null;

  if (audioCtx && masterBus && compressor && audioDest) {
    masterBus.gain.setValueAtTime(0.95, audioCtx.currentTime);
    compressor.threshold.setValueAtTime(-2.0, audioCtx.currentTime);
    compressor.knee.setValueAtTime(6, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.20, audioCtx.currentTime);
    masterBus.connect(compressor);
    compressor.connect(audioDest);
  }

  // Fon müziği miksajı: Kullanıcının seçtiği veya türe/konuya özel parça
  let bgmSource: AudioBufferSourceNode | null = null;
  let bgmGain: GainNode | null = null;
  if (audioCtx && masterBus && video.bgMusic !== 'none') {
    const bgmTrackPath = resolveBgmTrackPath(video.bgMusic, video.type, video.product, video.customMusicData);
    if (bgmTrackPath) {
      const bgmBuffer = await loadAudioBuffer(audioCtx, bgmTrackPath);
      if (bgmBuffer) {
        bgmSource = audioCtx.createBufferSource();
        bgmSource.buffer = bgmBuffer;
        bgmSource.loop = true;
        bgmGain = audioCtx.createGain();
        bgmGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        bgmSource.connect(bgmGain);
        bgmGain.connect(masterBus);
        bgmSource.start();
      }
    }
  }

  // 15. & 20. Adım: Sinematik Sahne Geçiş Ses Efekti (Foley & SFX Impact)
  const sfxBuffer = (audioCtx && isCinema)
    ? await loadAudioBuffer(audioCtx, '/audio_assets/cinema_sfx_impact.wav')
    : null;

  const canvasStream = canvas.captureStream(30);
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (audioDest) {
    combinedTracks.push(...audioDest.stream.getAudioTracks());
  }
  const combinedStream = new MediaStream(combinedTracks);

  let mimeType = 'video/webm;codecs=vp8,opus';
  if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) {
    mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
    mimeType = 'video/webm;codecs=vp8,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    mimeType = 'video/webm;codecs=vp9,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    mimeType = 'video/webm';
  }

  const isMp4 = mimeType.includes('mp4');
  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks: Blob[] = [];

  return new Promise<void>((resolve, reject) => {
    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (bgmSource) {
        try {
          bgmSource.stop();
        } catch {}
      }
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      try {
        const fileExt = isMp4 ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const cleanFileBase = (video.product || 'video_export')
          .replace(/_reklam.*$/i, '')
          .replace(/\s*\(\d+\)/g, '')
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_\-]/g, '') || 'video_export';
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cleanFileBase}.${fileExt}`;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    recorder.onerror = e => reject(e);
    recorder.start();

    (async () => {
      try {
        const totalSec = video.scenes.reduce((acc, s) => acc + s.sec, 0) || video.dur || 45;
        let accumulatedSec = 0;
        let currentVoSource: AudioBufferSourceNode | null = null;
        let currentVoGain: GainNode | null = null;
        onProgress?.(2, 'Görseller ve ses kanalları hazırlanıyor...');

        for (let idx = 0; idx < video.scenes.length; idx++) {
          const sc = video.scenes[idx];
          const img = sceneImages[idx];

          // Önceki sahneden kalan ses varsa pürüzsüzce kısarak durdur, asla üst üste binmesin!
          if (currentVoGain && audioCtx) {
            try {
              currentVoGain.gain.setValueAtTime(currentVoGain.gain.value, audioCtx.currentTime);
              currentVoGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.04);
            } catch {}
          }
          if (currentVoSource) {
            try { currentVoSource.stop(audioCtx ? audioCtx.currentTime + 0.05 : 0); } catch {}
            currentVoSource = null;
          }

          // 12. Adım: TTS sesini mikse dahil et
          if (sc.audioUrl && audioCtx && masterBus) {
            const voBuf = await loadAudioBuffer(audioCtx, sc.audioUrl);
            if (voBuf) {
              if (bgmGain) {
                bgmGain.gain.setValueAtTime(0.10, audioCtx.currentTime);
              }
              const voSrc = audioCtx.createBufferSource();
              voSrc.buffer = voBuf;
              const voGain = audioCtx.createGain();
              voGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
              voSrc.connect(voGain);
              voGain.connect(masterBus);
              voSrc.onended = () => {
                if (bgmGain && audioCtx) {
                  bgmGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                }
              };
              voSrc.start();
              currentVoSource = voSrc;
              currentVoGain = voGain;
            }
          }

          const frames = Math.max(15, Math.round(sc.sec * 30));
          const isZoomIn = sc.zoomDir !== 'out';

          for (let f = 0; f < frames; f++) {
            const progress = f / frames;

            if (f % 15 === 0 || f === frames - 1) {
              const currentElapsed = accumulatedSec + (f / frames) * sc.sec;
              const pct = Math.min(99, Math.round((currentElapsed / totalSec) * 100));
              onProgress?.(
                pct,
                `Sahne ${idx + 1}/${video.scenes.length}: ${sc.role} (${Math.round(currentElapsed)}/${Math.round(totalSec)} sn)`
              );
            }

            // 1. Dudak Senkronlu Video veya Sinematik Ken Burns Kamera Hareketi + Çapraz Erime (Cross-Dissolve)
            const sceneVideo = sceneVideos[idx];
            const prevImg = idx > 0 ? sceneImages[idx - 1] : null;
            const crossFadeFrames = 15; // ~0.50 saniyelik pürüzsüz sinematik geçiş

            if (sceneVideo && sceneVideo.readyState >= 2) {
              ctx.drawImage(sceneVideo, 0, 0, w, h);
            } else if (img) {
              const zoom = isZoomIn ? 1.0 + progress * 0.12 : 1.12 - progress * 0.12;
              const drawW = w * zoom;
              const drawH = h * zoom;
              const offsetX = (w - drawW) / 2;
              const offsetY = (h - drawH) / 2;

              // Sahne başlarında önceki görselden yeni görsele pürüzsüz sinematik erime geçişi
              if (idx > 0 && prevImg && f < crossFadeFrames) {
                const prevW = w * 1.12;
                const prevH = h * 1.12;
                ctx.drawImage(prevImg, (w - prevW) / 2, (h - prevH) / 2, prevW, prevH);

                const fadeAlpha = Math.min(1, Math.max(0, f / crossFadeFrames));
                ctx.save();
                ctx.globalAlpha = fadeAlpha;
                ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
                ctx.restore();
              } else {
                ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
              }
            } else {
              const grad = ctx.createLinearGradient(0, 0, w, h);
              grad.addColorStop(0, sc.grad[0]);
              grad.addColorStop(1, sc.grad[1]);
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, w, h);
            }

            // 2. Koyu Gradyan Alt Kuşak
            const overlayGrad = ctx.createLinearGradient(0, h * (isCinema ? 0.35 : 0.45), 0, h);
            overlayGrad.addColorStop(0, 'rgba(10, 16, 32, 0)');
            overlayGrad.addColorStop(0.35, 'rgba(10, 16, 32, 0.65)');
            overlayGrad.addColorStop(1, 'rgba(10, 16, 32, 0.95)');
            ctx.fillStyle = overlayGrad;
            ctx.fillRect(0, 0, w, h);

            // 3. Üst Bilgi Rozeti
            const badgeAlpha = Math.min(1, Math.max(0, (progress - 0.05) / 0.15));
            ctx.save();
            ctx.globalAlpha = badgeAlpha;
            ctx.fillStyle = isCinema ? '#fde047' : isDocumentary ? '#34d399' : isYouTube ? '#f87171' : '#9fc4f5';
            ctx.font = '600 28px "Segoe UI", system-ui, sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 3;
            const cleanBadgeTitle = (video.product || 'VİDEO PROJESİ')
              .replace(/_reklam.*$/i, '')
              .replace(/\s*\(\d+\)/g, '')
              .replace(/_/g, ' ')
              .trim()
              .toUpperCase();
            const badgePrefix = isCinema ? '🎬 SİNEMA · ' : isDocumentary ? '🎙️ BELGESEL · ' : isYouTube ? '🔴 YOUTUBE · ' : (video.type === 'reklam' ? '📢 REKLAM · ' : '🏢 ');
            ctx.fillText(`${badgePrefix}${cleanBadgeTitle}`, 80, 75);

            // 4. Ana Başlık / Replik / Belgesel Bölümü
            const titleAlpha = Math.min(1, Math.max(0, (progress - 0.1) / 0.2));
            ctx.globalAlpha = titleAlpha;
            ctx.fillStyle = '#ffffff';
            ctx.font = isCinema || isDocumentary
              ? 'bold 48px "Georgia", "Segoe UI", serif'
              : 'bold 52px "Segoe UI", system-ui, sans-serif';
            const textY = isCinema || isDocumentary ? h - 170 : h - 210;
            ctx.fillText(sc.text, 80, textY);

            // 5. Alt Başlık (Subtitle / Lokasyon & Bilgi Kartı)
            if (sc.subtitle) {
              const subAlpha = Math.min(1, Math.max(0, (progress - 0.2) / 0.2));
              ctx.globalAlpha = subAlpha;
              ctx.fillStyle = isCinema ? '#e2e8f0' : isDocumentary ? '#a7f3d0' : isYouTube ? '#fed7aa' : '#bfe0ff';
              ctx.font = '500 30px "Segoe UI", system-ui, sans-serif';
              ctx.fillText(sc.subtitle, 82, textY + 50);
            }

            // 6. Vurgu Metni (Highlight / Çarpıcı Belgesel Bulgusu / Vizyon Tarihi)
            if (sc.highlight) {
              const hlAlpha = Math.min(1, Math.max(0, (progress - 0.3) / 0.2));
              ctx.globalAlpha = hlAlpha;
              ctx.fillStyle = isCinema ? '#38bdf8' : isDocumentary ? '#fbbf24' : isYouTube ? '#ef4444' : '#ffd35c';
              ctx.font = '600 26px "Segoe UI", system-ui, sans-serif';
              const icon = isCinema ? '✦ ' : isDocumentary ? '🔍 ' : isYouTube ? '▶ ' : '★  ';
              ctx.fillText(`${icon}${sc.highlight}`, 82, textY + 95);
            }

            // 7. YouTube İlerleme Çubuğu (YouTube için özel kırmızı alt çizgi)
            if (isYouTube) {
              const totalProgress = (idx + progress) / video.scenes.length;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.fillRect(0, h - 8, w, 8);
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(0, h - 8, w * totalProgress, 8);
            }

            // 18. Adım: Sinematik Vignette & Derinlik Katmanı
            const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, Math.max(w, h) * 0.65);
            vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, w, h);

            // 19. Adım: Açılış Jeneriği (Opening Title Card)
            if (isCinema && idx === 0 && progress < 0.22) {
              const introAlpha = Math.sin((progress / 0.22) * Math.PI);
              ctx.save();
              ctx.globalAlpha = introAlpha;
              ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
              ctx.fillRect(0, 0, w, h);
              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.font = '600 36px "Segoe UI", sans-serif';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 12;
              ctx.fillText('🎬 KLAKET AI STUDIOS SUNAR', w / 2, h / 2);
              ctx.restore();
            }

            // 19. Adım: Kapanış Jeneriği & Künye
            if (isCinema && idx === video.scenes.length - 1 && progress > 0.6) {
              const creditAlpha = Math.min(1, (progress - 0.6) / 0.3);
              ctx.save();
              ctx.globalAlpha = creditAlpha * 0.85;
              ctx.fillStyle = '#94a3b8';
              ctx.font = '500 22px "Segoe UI", sans-serif';
              ctx.textAlign = 'right';
              ctx.fillText(
                `YÖNETMEN: AI STUDIO • ${video.character?.enabled ? `BAŞROL: ${video.character.name.toUpperCase()}` : 'KLAKET SOP'}`,
                w - 80,
                75
              );
              ctx.restore();
            }

            ctx.restore();
            await sleep(30);
          }
          accumulatedSec += sc.sec;
        }
        onProgress?.(100, 'Video dosyası tamamlandı, tarayıcıya indiriliyor...');
        recorder.stop();
      } catch (err) {
        recorder.stop();
        reject(err);
      }
    })();
  });
}

export function downloadVideoJson(video: VideoItem): void {
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(video, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', `${video.product.replace(/\s+/g, '_')}_senaryo.json`);
  dlAnchor.click();
}

/**
 * 23. Adım: Hollywood standardında dikey (2:3) resmi film afişi üretir ve indirir.
 */
export async function exportFilmPoster(video: VideoItem): Promise<void> {
  const posterW = 1200;
  const posterH = 1800;
  const canvas = document.createElement('canvas');
  canvas.width = posterW;
  canvas.height = posterH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const heroImageSrc = video.scenes[0]?.imageUrl || video.scenes[1]?.imageUrl;
  const heroImg = await loadImage(heroImageSrc);

  if (heroImg) {
    const scale = Math.max(posterW / heroImg.width, posterH / heroImg.height);
    const sw = heroImg.width * scale;
    const sh = heroImg.height * scale;
    const sx = (posterW - sw) / 2;
    const sy = (posterH - sh) / 2;
    ctx.drawImage(heroImg, sx, sy, sw, sh);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, posterH);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, posterW, posterH);
  }

  // Sinematik karartma ve vignette
  const vig = ctx.createLinearGradient(0, 0, 0, posterH);
  vig.addColorStop(0, 'rgba(0,0,0,0.7)');
  vig.addColorStop(0.2, 'rgba(0,0,0,0.15)');
  vig.addColorStop(0.65, 'rgba(0,0,0,0.35)');
  vig.addColorStop(0.85, 'rgba(0,0,0,0.92)');
  vig.addColorStop(1, '#000000');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, posterW, posterH);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 24px "Segoe UI", sans-serif';
  ctx.fillText('KLAKET AI STUDIOS SUNAR', posterW / 2, 90);

  if (video.character?.enabled) {
    ctx.font = '700 28px "Segoe UI", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(video.character.name.toUpperCase(), posterW / 2, 140);
    ctx.font = '500 18px "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(video.character.roleArchetype.toUpperCase(), posterW / 2, 175);
  }

  const tagline = video.scenes[0]?.subtitle || video.points.split('\n')[0] || 'KADERİNİ YENİDEN YAZACAK';
  ctx.font = 'italic 600 32px "Georgia", serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 10;
  ctx.fillText(`"${tagline.replace(/^"|"$/g, '')}"`, posterW / 2, posterH - 460);

  // Devasa Film Başlığı
  ctx.font = '900 84px "Georgia", "Segoe UI", serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 24;
  ctx.fillText(video.product.toUpperCase(), posterW / 2, posterH - 350);

  ctx.shadowBlur = 0;
  ctx.font = '700 36px "Segoe UI", sans-serif';
  ctx.fillStyle = '#facc15';
  ctx.fillText((video.cta || 'ÇOK YAKINDA SİNEMALARDA VE DİJİTAL PLATFORMLARDA').toUpperCase(), posterW / 2, posterH - 260);

  // Hollywood Billing Block (Sinema Künyesi)
  ctx.font = '400 15px "Segoe UI", monospace';
  ctx.fillStyle = '#64748b';
  const billingLine1 = 'KLAKET PICTURES PRESENTS AN ARTIFICIAL INTELLIGENCE PRODUCTION • DIRECTED BY GEMINI 2.5 FLASH';
  const billingLine2 = `STARRING ${video.character?.enabled ? video.character.name.toUpperCase() : 'AI ENSEMBLE'} • CINEMATOGRAPHY BY FLUX AI • MUSIC BY KLAKET SOUND DESIGN`;
  const billingLine3 = 'ORIGINAL SCREENPLAY GENERATED WITH 24-STEP SOP PIPELINE • DOLBY CINEMA • IMAX';
  ctx.fillText(billingLine1, posterW / 2, posterH - 150);
  ctx.fillText(billingLine2, posterW / 2, posterH - 120);
  ctx.fillText(billingLine3, posterW / 2, posterH - 90);

  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${video.product.replace(/\s+/g, '_')}_Resmi_Film_Afisi.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/jpeg', 0.95);
}

/**
 * 24. Adım: YouTube, Sosyal Medya ve Dağıtım Paketini (.md) indirir.
 */
export function downloadDistributionPackage(video: VideoItem): void {
  const content = `# 🎬 Dağıtım & Yayın Paketi: ${video.product}

## 📋 Genel Yapım Bilgileri
- **Film / Yapım Adı:** ${video.product}
- **Yapım Türü:** ${video.type.toUpperCase()}
- **En-Boy Oranı:** ${video.ratio}
- **Toplam Süre:** ${video.dur} saniye (${video.scenes.length} Sahne)
- **Ses Dili:** ${video.lang || 'tr-TR'}
- **Hedef Kitle:** ${video.audience || 'Genel İzleyici'}
- **Anlatım Tonu:** ${video.tone}

---

## 🎭 Oyuncu Kadrosu & Karakterler
${video.character?.enabled ? `
- **Başrol:** ${video.character.name} (${video.character.gender === 'female' ? 'Kadın' : 'Erkek'})
- **Rol / Arketip:** ${video.character.roleArchetype}
- **Görünüm & Kostüm:** ${video.character.appearance} • ${video.character.clothing}
` : '- Çoklu AI Anlatıcı Kadrosu (Puck & Kore)'}

---

## 📺 YouTube Yayın Metni
**Başlık:**
${video.product} | Resmi Sinematik Fragman (4K)

**Açıklama:**
${video.product} çok yakında izleyiciyle buluşuyor!

📌 **Konu & Özet:**
${video.points}

🎬 **Vizyon:** ${video.cta || 'Çok yakında sinemalarda ve dijital platformlarda.'}

---

## 📱 Sosyal Medya (Instagram Reels / TikTok / YouTube Shorts)
**Metin / Caption:**
🔥 ${video.product} için ilk resmi tanıtım yayında! Sizce hikayenin sonunda ne olacak? Yorumlarda buluşalım 👇
#sinema #yapayzeka #film #fragman #${video.product.toLowerCase().replace(/[^a-z0-9]/g, '')} #klaket

---

## 📜 Sahne ve Replik Dökümü (Screenplay)
${video.scenes.map(s => `### Sahne ${s.id}: ${s.role} (${s.sec}s)
- **Konuşmacı:** ${s.speaker || (s.voiceGender === 'female' ? 'Kadın Ses' : 'Erkek Ses')}
- **Diyalog (VO):** "${s.vo}"
- **Altyazı:** ${s.subtitle || '-'}
- **Görsel Yönergesi:** ${s.visual}
`).join('\n')}

---
*Bu yapım paketi Klaket Studio 24 Adımlı Film Üretim Boru Hattı ile otomatik üretilmiştir.*
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${video.product.replace(/\s+/g, '_')}_Yayin_Dagitim_Paketi.md`;
  a.click();
  URL.revokeObjectURL(url);
}
