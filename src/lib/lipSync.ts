'use client';

/**
 * Klaket Studio - Dudak Senkronizasyonu (Lip-Sync) & Konuşan Yüz Motoru
 * Hem yerel ses analizörlü yüz/ağız animasyon motorunu (Zero-Setup)
 * hem de harici SadTalker / LivePortrait API entegrasyonlarını destekler.
 */

export interface LipSyncOptions {
  imageUrl: string;
  audioUrl?: string;
  durationSec: number;
  engine?: 'local' | 'liveportrait' | 'sadtalker' | 'replicate';
  replicateApiKey?: string;
  width?: number;
  height?: number;
  onProgress?: (progress: number, statusText: string) => void;
}

export interface LipSyncResult {
  videoUrl: string;
  provider: 'local' | 'liveportrait' | 'sadtalker' | 'replicate';
  durationSec: number;
}

/**
 * Bir görsel URL'sini HTMLImageElement olarak yükler
 */
function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Görsel yüklenemedi: ' + src));
    img.src = src;
  });
}

/**
 * Audio dosyasını fetch edip AudioBuffer olarak çözer
 */
async function loadAudioBuffer(audioCtx: AudioContext, audioUrl: string): Promise<AudioBuffer | null> {
  try {
    const res = await fetch(audioUrl);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuf);
  } catch (err) {
    console.warn('Lip-sync için ses çözümlenemedi:', err);
    return null;
  }
}

/**
 * AudioBuffer'dan saniye/frame başına düşen konuşma genliğini (amplitude / RMS) çıkarır.
 * Bu sayede sesin yüksek olduğu anlarda ağız daha çok açılır, duraklamalarda kapanır.
 */
function extractSpeechEnvelopes(audioBuffer: AudioBuffer | null, durationSec: number, fps = 30): number[] {
  const totalFrames = Math.max(15, Math.round(durationSec * fps));
  const envelopes: number[] = new Array(totalFrames).fill(0);

  if (!audioBuffer) {
    // Ses yoksa konuşma benzeri yapay bir konuşma ritmi (viseme) üret
    for (let f = 0; f < totalFrames; f++) {
      const t = f / fps;
      // Konuşma ritmi: kelimeler arası es ve hece salınımı
      const syllable = Math.sin(t * 14) * 0.5 + 0.5;
      const pause = Math.sin(t * 2.5) > 0.2 ? 1 : 0.05;
      envelopes[f] = syllable * pause * 0.75;
    }
    return envelopes;
  }

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const samplesPerFrame = Math.floor(sampleRate / fps);

  for (let f = 0; f < totalFrames; f++) {
    const startSample = f * samplesPerFrame;
    const endSample = Math.min(channelData.length, startSample + samplesPerFrame);
    if (startSample >= channelData.length) {
      envelopes[f] = 0;
      continue;
    }

    // RMS (Root Mean Square) genlik hesabı
    let sumSquares = 0;
    let count = 0;
    for (let s = startSample; s < endSample; s += 4) {
      const val = channelData[s];
      sumSquares += val * val;
      count++;
    }
    const rms = count > 0 ? Math.sqrt(sumSquares / count) : 0;
    // Normalize et ve konuşma hassasiyetini artır (gain boost)
    const norm = Math.min(1.0, Math.max(0, (rms - 0.01) * 6.5));
    envelopes[f] = norm;
  }

  // Yumuşatma (smoothing) filtresi ile ani sıçramaları önle
  for (let i = 1; i < envelopes.length - 1; i++) {
    envelopes[i] = envelopes[i - 1] * 0.25 + envelopes[i] * 0.5 + envelopes[i + 1] * 0.25;
  }

  return envelopes;
}

/**
 * Yerel Tarayıcı İçi (Zero-Dependency) Dudak ve Konuşan Yüz Video Sentezleyici
 * Karakter görselindeki ağız/çene bölgesini ses genliğiyle senkronize hareket ettirerek
 * gerçek bir MP4/WebM konuşan video klibi üretir.
 */
export async function generateLocalLipSyncClip(options: LipSyncOptions): Promise<LipSyncResult> {
  const { imageUrl, audioUrl, durationSec, onProgress } = options;

  onProgress?.(10, 'Karakter görseli ve stüdyo sesi analiz ediliyor...');

  const img = await loadImageElement(imageUrl);

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  let audioBuffer: AudioBuffer | null = null;
  if (audioUrl) {
    audioBuffer = await loadAudioBuffer(audioCtx, audioUrl);
  }

  const fps = 30;
  const envelopes = extractSpeechEnvelopes(audioBuffer, durationSec, fps);
  const totalFrames = envelopes.length;

  // Render canvas hazırla
  const canvas = document.createElement('canvas');
  const w = options.width || 1280;
  const h = options.height || 720;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context oluşturulamadı.');

  // Ses destination
  const audioDest = audioCtx.createMediaStreamDestination();
  let audioSource: AudioBufferSourceNode | null = null;
  if (audioBuffer) {
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(audioDest);
  }

  const stream = canvas.captureStream(fps);
  if (audioBuffer) {
    const audioTrack = audioDest.stream.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);
  }

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm')
    ? 'video/webm'
    : 'video/mp4';

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  return new Promise<LipSyncResult>((resolve, reject) => {
    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      audioCtx.close().catch(() => {});
      const blob = new Blob(chunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(blob);
      onProgress?.(100, 'Dudak senkronlu video hazır!');
      resolve({
        videoUrl,
        provider: 'local',
        durationSec
      });
    };

    recorder.onerror = e => {
      audioCtx.close().catch(() => {});
      reject(e);
    };

    recorder.start();
    if (audioSource) audioSource.start();

    // Ağız ve çene anatomik bölgesini en-boy oranına göre hesapla (Dikey 9:16, Sinematik 21:9 veya Yatay 16:9)
    const aspect = w / h;
    let mouthYRatio = 0.58;
    let mouthWRatio = 0.16;
    let mouthHRatio = 0.12;
    let eyeYRatio = 0.42;

    if (aspect < 0.8) {
      // 9:16 Dikey Shorts / Reels (Karakter başı dikeyde daha yukarıda konumlanır)
      mouthYRatio = 0.46;
      mouthWRatio = 0.20;
      mouthHRatio = 0.09;
      eyeYRatio = 0.34;
    } else if (aspect > 2.0) {
      // 21:9 Cinemascope Geniş Ekran
      mouthYRatio = 0.55;
      mouthWRatio = 0.14;
      mouthHRatio = 0.13;
      eyeYRatio = 0.38;
    }

    const mouthBox = {
      x: Math.round(w * (0.50 - mouthWRatio / 2)),
      y: Math.round(h * mouthYRatio),
      w: Math.round(w * mouthWRatio),
      h: Math.round(h * mouthHRatio)
    };

    let frame = 0;
    const intervalMs = 1000 / fps;

    function renderFrame() {
      if (!ctx) return;
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const amp = envelopes[frame] || 0;
      const t = frame / fps;

      // 1. İnce Kafa Salınımı & Nefes Alma Hareketi (Subtle Head Motion)
      const headSwayX = Math.sin(t * 1.8) * 3;
      const headSwayY = Math.cos(t * 1.4) * 2;
      const headTilt = Math.sin(t * 1.2) * 0.005;

      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.translate(w / 2 + headSwayX, h / 2 + headSwayY);
      ctx.rotate(headTilt);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();

      // 2. Dudak & Çene Hareketi (Lip-Sync Morphing)
      if (amp > 0.05) {
        ctx.save();
        // Ağız ve çene esneme payı (sese göre dikey açılma)
        const mouthOpen = Math.min(14, Math.round(amp * 16));
        const jawDrop = Math.min(8, Math.round(amp * 10));

        // Ağız içi koyuluğu ve dudak ayrımı
        ctx.save();
        ctx.beginPath();
        const mx = mouthBox.x + headSwayX;
        const my = mouthBox.y + headSwayY;
        const mw = mouthBox.w;
        const mh = mouthBox.h;

        // Ağız ovali
        ctx.ellipse(
          mx + mw / 2,
          my + mh / 2,
          mw * 0.35,
          Math.max(2, mouthOpen * 0.7),
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(28, 14, 18, 0.85)';
        ctx.fill();

        // Diş veya dil ışıltısı
        if (mouthOpen > 5) {
          ctx.beginPath();
          ctx.ellipse(
            mx + mw / 2,
            my + mh / 2 - mouthOpen * 0.25,
            mw * 0.25,
            Math.max(1, mouthOpen * 0.2),
            0,
            0,
            Math.PI
          );
          ctx.fillStyle = 'rgba(240, 235, 230, 0.75)';
          ctx.fill();
        }
        ctx.restore();

        // Alt dudak ve çene gölgesini sese göre hafif aşağı ötele (organik çene hareketi)
        ctx.save();
        ctx.beginPath();
        ctx.rect(mx, my + mh * 0.5, mw, mh * 0.8);
        ctx.clip();
        ctx.drawImage(
          img,
          (mouthBox.x / w) * img.naturalWidth,
          ((mouthBox.y + mh * 0.5) / h) * img.naturalHeight,
          (mw / w) * img.naturalWidth,
          ((mh * 0.8) / h) * img.naturalHeight,
          mx,
          my + mh * 0.5 + jawDrop,
          mw,
          mh * 0.8
        );
        ctx.restore();

        ctx.restore();
      }

      // 3. Doğal Göz Kırpma (Blinking) - Her 3-4 saniyede bir 4 frame
      const blinkCycle = Math.floor(t * 10) % 36;
      if (blinkCycle === 0 || blinkCycle === 1) {
        const eyeY = Math.round(h * eyeYRatio + headSwayY);
        const eyeW = Math.round(w * 0.08);
        const eyeH = Math.round(h * 0.025);
        ctx.save();
        ctx.fillStyle = 'rgba(40, 30, 25, 0.4)';
        // Sol göz kapağı
        ctx.fillRect(Math.round(w * 0.38 + headSwayX), eyeY, eyeW, eyeH);
        // Sağ göz kapağı
        ctx.fillRect(Math.round(w * 0.54 + headSwayX), eyeY, eyeW, eyeH);
        ctx.restore();
      }

      frame++;
      const currentPct = Math.round(15 + (frame / totalFrames) * 80);
      onProgress?.(currentPct, `Dudak senkron kareleri işleniyor (${frame}/${totalFrames})...`);

      setTimeout(renderFrame, intervalMs);
    }

    renderFrame();
  });
}

/**
 * Sahne için dudak senkronu klibi oluşturur.
 * Sunucu API (LivePortrait / SadTalker) varsa onu çağırır;
 * yoksa otomatik olarak sıfır kesintili yerel motoru çalıştırır.
 */
export async function generateLipSyncForScene(
  options: LipSyncOptions
): Promise<LipSyncResult> {
  const { imageUrl, audioUrl, engine = 'local', replicateApiKey, onProgress } = options;

  // Replicate / SadTalker / LivePortrait API seçildiyse ve API key varsa backend route'a gönder
  if (engine !== 'local' && (replicateApiKey || engine === 'liveportrait' || engine === 'sadtalker')) {
    try {
      onProgress?.(15, `Bulut AI (${engine.toUpperCase()}) dudak senkron motoruna bağlanılıyor...`);
      const res = await fetch('/api/lipsync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          audioUrl,
          durationSec: options.durationSec,
          engine,
          apiKey: replicateApiKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.videoUrl) {
          onProgress?.(100, `${engine.toUpperCase()} ile dudak senkronu tamamlandı!`);
          return {
            videoUrl: data.videoUrl,
            provider: engine,
            durationSec: options.durationSec
          };
        }
      }
      console.warn('Bulut API yanıt vermedi veya token yok, yerel motora geçiliyor...');
    } catch (err) {
      console.warn('Bulut lip-sync çağrısı başarısız, yerel motor devreye giriyor:', err);
    }
  }

  // Varsayılan / Fallback: Yerel Ses Dalga Boyu & Viseme Motoru
  return generateLocalLipSyncClip(options);
}
