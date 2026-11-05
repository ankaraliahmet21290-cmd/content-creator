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

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  if (line.trim()) lines.push(line.trim());

  const totalHeight = lines.length * lineHeight;
  let curY = y - totalHeight / 2 + lineHeight / 2;
  for (const l of lines) {
    ctx.fillText(l, x, curY);
    curY += lineHeight;
  }
}

export async function exportVideoFile(video: VideoItem): Promise<void> {
  let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'renderCanvas';
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
  }

  const [aspectW, aspectH] = RATIOS[video.ratio] || [9, 16];
  const w = aspectW > aspectH ? 1280 : aspectW === aspectH ? 720 : 720;
  const h = aspectW > aspectH ? 720 : aspectW === aspectH ? 720 : 1280;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context oluşturulamadı.');

  // Sahnelerin AI görsellerini önceden yükle
  const sceneImages = await Promise.all(video.scenes.map(sc => loadImage(sc.imageUrl)));

  // Ses akışı için AudioContext hazırla (Gemini TTS seslerini videoya gömmek için)
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;
  const audioDest = audioCtx ? audioCtx.createMediaStreamDestination() : null;

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

  return new Promise<void>((resolve, reject) => {
    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      try {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${video.product.replace(/\s+/g, '_')}_ai_video.webm`;
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

          // Sahnenin Gemini TTS sesi varsa AudioContext üzerinden stream'e çal
          if (sc.audioUrl && audioCtx && audioDest) {
            try {
              const res = await fetch(sc.audioUrl);
              const arrBuf = await res.arrayBuffer();
              const audioBuf = await audioCtx.decodeAudioData(arrBuf);
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuf;
              source.connect(audioDest);
              source.start();
            } catch {
              // Ses decode edilemezse sessiz devam et
            }
          }

          const frames = Math.max(10, Math.round(sc.sec * 15));
          for (let f = 0; f < frames; f++) {
            // 1. Arka Plan Gradyanı veya AI Görseli (Ken Burns hafif zoom efektiyle)
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, sc.grad[0]);
            grad.addColorStop(1, sc.grad[1]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            if (img) {
              const scale = 1 + (f / frames) * 0.06;
              const drawW = w * scale;
              const drawH = h * scale;
              const offsetX = (w - drawW) / 2;
              const offsetY = (h - drawH) / 2;
              ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
            }

            // 2. Üst Rozet & Rol
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(40, 40, 320, 48);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
            ctx.fillText(`${sc.role} • ${sc.sec}s • Gemini AI`, 55, 71);

            // 3. Ekran Metni (Başlık)
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            drawWrappedText(ctx, sc.text, w / 2, h / 2 - 40, w - 120, 50);

            // 4. Seslendirme Altyazısı
            ctx.font = 'italic 24px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            drawWrappedText(ctx, `🎙️ ${sc.vo}`, w / 2, h / 2 + 85, w - 140, 34);

            ctx.textAlign = 'left';
            await sleep(65);
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
