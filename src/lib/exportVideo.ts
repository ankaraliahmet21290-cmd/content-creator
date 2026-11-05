'use client';

import { RATIOS } from './constants';
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

function loadAudioBuffer(audioCtx: AudioContext, url: string): Promise<AudioBuffer | null> {
  return fetch(url)
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .catch(() => null);
}

/**
 * korkmaz-gayrimenkul-tanitim-v5 kalitesinde 1080p sinematik render motoru
 */
export async function exportVideoFile(video: VideoItem): Promise<void> {
  let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'renderCanvas';
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
  }

  const [aspectW, aspectH] = RATIOS[video.ratio] || [16, 9];
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

  // Gerçek fotoğrafları önceden yükle
  const sceneImages = await Promise.all(video.scenes.map(sc => loadImage(sc.imageUrl)));

  // Ses sistemi: Satış fon müziği + Gemini AI seslendirmesini miksle
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;
  const audioDest = audioCtx ? audioCtx.createMediaStreamDestination() : null;

  // Fon müziği buffer'ını yükle
  const bgmBuffer = audioCtx ? await loadAudioBuffer(audioCtx, '/sales-music.wav') : null;
  let bgmSource: AudioBufferSourceNode | null = null;
  if (audioCtx && audioDest && bgmBuffer) {
    bgmSource = audioCtx.createBufferSource();
    bgmSource.buffer = bgmBuffer;
    bgmSource.loop = true;
    const bgmGain = audioCtx.createGain();
    bgmGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    bgmSource.connect(bgmGain);
    bgmGain.connect(audioDest);
    bgmSource.start();
  }

  const canvasStream = canvas.captureStream(30);
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
  if (audioDest) {
    combinedTracks.push(...audioDest.stream.getAudioTracks());
  }
  const combinedStream = new MediaStream(combinedTracks);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks: Blob[] = [];

  const isCinema = video.type === 'sinema' || video.ratio === '21:9';
  const isYouTube = video.type === 'youtube';

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
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const typeSuffix = isCinema ? 'sinema_filmi' : isYouTube ? 'youtube_video' : 'video';
        a.download = `${video.product.replace(/\s+/g, '_')}_${typeSuffix}.webm`;
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
        for (let idx = 0; idx < video.scenes.length; idx++) {
          const sc = video.scenes[idx];
          const img = sceneImages[idx];

          // TTS sesini mikse dahil et
          if (sc.audioUrl && audioCtx && audioDest) {
            const voBuf = await loadAudioBuffer(audioCtx, sc.audioUrl);
            if (voBuf) {
              const voSrc = audioCtx.createBufferSource();
              voSrc.buffer = voBuf;
              const voGain = audioCtx.createGain();
              voGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
              voSrc.connect(voGain);
              voGain.connect(audioDest);
              voSrc.start();
            }
          }

          const frames = Math.max(15, Math.round(sc.sec * 30));
          const isZoomIn = sc.zoomDir !== 'out';

          for (let f = 0; f < frames; f++) {
            const progress = f / frames;

            // 1. Sinematik Ken Burns Kamera Hareketi (v5 algoritması)
            const zoom = isZoomIn ? 1.0 + progress * 0.12 : 1.12 - progress * 0.12;

            if (img) {
              const drawW = w * zoom;
              const drawH = h * zoom;
              const offsetX = (w - drawW) / 2;
              const offsetY = (h - drawH) / 2;
              ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
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
            ctx.fillStyle = isCinema ? '#fde047' : isYouTube ? '#f87171' : '#9fc4f5';
            ctx.font = '600 28px "Segoe UI", system-ui, sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 3;
            const badgePrefix = isCinema ? '🎬 SİNEMA · ' : isYouTube ? '🔴 YOUTUBE · ' : '';
            ctx.fillText(`${badgePrefix}${video.product.toUpperCase()}`, 80, 75);

            // 4. Ana Başlık / Replik
            const titleAlpha = Math.min(1, Math.max(0, (progress - 0.1) / 0.2));
            ctx.globalAlpha = titleAlpha;
            ctx.fillStyle = '#ffffff';
            ctx.font = isCinema
              ? 'bold 48px "Georgia", "Segoe UI", serif'
              : 'bold 52px "Segoe UI", system-ui, sans-serif';
            const textY = isCinema ? h - 170 : h - 210;
            ctx.fillText(sc.text, 80, textY);

            // 5. Alt Başlık (Subtitle)
            if (sc.subtitle) {
              const subAlpha = Math.min(1, Math.max(0, (progress - 0.2) / 0.2));
              ctx.globalAlpha = subAlpha;
              ctx.fillStyle = isCinema ? '#e2e8f0' : isYouTube ? '#fed7aa' : '#bfe0ff';
              ctx.font = '500 30px "Segoe UI", system-ui, sans-serif';
              ctx.fillText(sc.subtitle, 82, textY + 50);
            }

            // 6. Vurgu Metni (Highlight / CTA / Abone Ol)
            if (sc.highlight) {
              const hlAlpha = Math.min(1, Math.max(0, (progress - 0.3) / 0.2));
              ctx.globalAlpha = hlAlpha;
              ctx.fillStyle = isCinema ? '#38bdf8' : isYouTube ? '#ef4444' : '#ffd35c';
              ctx.font = '600 26px "Segoe UI", system-ui, sans-serif';
              const icon = isCinema ? '✦ ' : isYouTube ? '▶ ' : '★  ';
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

            ctx.restore();
            await sleep(30);
          }
        }
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
