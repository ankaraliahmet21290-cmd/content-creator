import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getScenePhoto } from '@/lib/assets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPrompt: string = body.prompt || '';
    const ratio: string = body.ratio || '21:9';
    const role: string = body.role || 'Sahne';
    const briefType: string = body.type || 'sinema';
    const characterPrompt: string = body.characterPrompt || '';

    if (!rawPrompt.trim()) {
      return NextResponse.json({ error: 'Görsel promptu boş olamaz.' }, { status: 400 });
    }

    // Sinematik format ölçüleri
    let width = 1280;
    let height = 548; // 21:9
    if (ratio === '16:9') {
      width = 1280;
      height = 720;
    } else if (ratio === '9:16') {
      width = 720;
      height = 1280;
    } else if (ratio === '1:1') {
      width = 800;
      height = 800;
    }

    const charPrefix = characterPrompt.trim() ? `${characterPrompt.trim()}, ` : '';

    // Prompt zenginleştirme (Hollywood film stili, 35mm anamorfik lens, gerçekçi ışık)
    let enhancedPrompt = `${charPrefix}${rawPrompt.trim()}, award-winning cinematic 35mm film still, shot on Arri Alexa LF with Panavision anamorphic primes, 21:9 cinemascope, cinematic volumetric rim lighting, subtle film grain, color graded in DaVinci Resolve, photorealistic movie scene, 8k resolution, hyperdetailed, master cinematography`;
    if (briefType === 'belgesel') {
      enhancedPrompt = `${charPrefix}${rawPrompt.trim()}, National Geographic and BBC Earth documentary film still, shot on Hasselblad, natural sunlight, organic textures, photorealistic documentary cinematography, 8k resolution, atmospheric depth`;
    } else if (briefType === 'youtube') {
      enhancedPrompt = `${charPrefix}${rawPrompt.trim()}, high production value YouTube 4K video frame, studio lighting, crisp focus, vibrant colors, cinematic b-roll, 8k`;
    } else if (briefType === 'reklam') {
      enhancedPrompt = `${charPrefix}${rawPrompt.trim()}, professional commercial advertising photography, luxury studio lighting, 8k resolution, photorealistic, premium commercial aesthetic, crisp sharp detail, award-winning cinematography`;
    } else if (briefType === 'sosyal') {
      enhancedPrompt = `${charPrefix}${rawPrompt.trim()}, trending high-retention 9:16 vertical frame for YouTube Shorts and TikTok, vibrant colors, crisp mobile cinematography, 8k resolution, dynamic focal depth`;
    }

    const encoded = encodeURIComponent(enhancedPrompt);
    let seed = Math.floor(Math.random() * 999999);
    if (characterPrompt.trim()) {
      let hash = 0;
      for (let i = 0; i < characterPrompt.length; i++) {
        hash = (hash << 5) - hash + characterPrompt.charCodeAt(i);
        hash |= 0;
      }
      seed = Math.abs(hash) % 700000 + Math.floor(Math.random() * 50);
    }

    // 1. Kademe: Flux AI Motoru (9 sn zaman aşımı)
    const fluxUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const res = await fetch(fluxUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length > 5000) {
          const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 10);
          const filename = `ai_scene_${Date.now()}_${hash}.jpg`;
          const dir = path.join(process.cwd(), 'public', 'generated_assets');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const savePath = path.join(dir, filename);
          fs.writeFileSync(savePath, buffer);

          return NextResponse.json({
            success: true,
            provider: 'flux-pollinations',
            imageUrl: `/api/assets/${filename}`
          });
        }
      }
    } catch {
      // Flux meşgulse Hızlı Turbo modeline geç
    }

    // 2. Kademe: Hızlı Turbo AI Motoru (SDXL Hızlı Sentez - 8 sn zaman aşımı)
    const turboUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=turbo`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(turboUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length > 5000) {
          const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 10);
          const filename = `ai_scene_${Date.now()}_${hash}.jpg`;
          const dir = path.join(process.cwd(), 'public', 'generated_assets');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const savePath = path.join(dir, filename);
          fs.writeFileSync(savePath, buffer);

          return NextResponse.json({
            success: true,
            provider: 'turbo-pollinations',
            imageUrl: `/api/assets/${filename}`
          });
        }
      }
    } catch {
      // Harici servis yanıt vermezse tematik fotoğraf havuzuna geç
    }

    // 3. Kademe: Konuya %100 Uyumlu Yüksek Çözünürlüklü Tematik Fotoğraf Eşleştirmesi
    const fallbackUrl = getScenePhoto(briefType, role, rawPrompt, seed % 10, rawPrompt);
    return NextResponse.json({
      success: true,
      provider: 'thematic-photo-matcher',
      imageUrl: fallbackUrl,
      note: 'Konuya uygun yüksek çözünürlüklü foto-gerçekçi sahne karesi bağlandı.'
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
