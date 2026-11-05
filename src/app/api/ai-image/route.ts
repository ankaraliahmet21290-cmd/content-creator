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
    }

    // Prompt zenginleştirme (Hollywood film stili, anamorfik lens, gerçekçi ışık)
    const enhancedPrompt = `${rawPrompt.trim()}, 21:9 cinemascope, anamorphic film still, cinematic lighting, 8k, photorealistic, unreal engine 5 render, hyperdetailed`;
    const encoded = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const res = await fetch(pollinationsUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (buffer.length > 5000) {
          const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 10);
          const filename = `ai_scene_${Date.now()}_${hash}.jpg`;
          const savePath = path.join(process.cwd(), 'public', 'generated_assets', filename);
          fs.writeFileSync(savePath, buffer);

          return NextResponse.json({
            success: true,
            provider: 'flux-pollinations',
            imageUrl: `/generated_assets/${filename}`
          });
        }
      }
    } catch {
      // ignore network / timeout
    }

    // Yedek: Eğer harici servis kotaya takılırsa yerel HD karelerden en uygununu seç
    const fallbackUrl = getScenePhoto(briefType, role, rawPrompt, seed % 10);
    return NextResponse.json({
      success: true,
      provider: 'curated-cinema-fallback',
      imageUrl: fallbackUrl,
      note: 'Yapay zekâ görsel servisi yoğun olduğunda stüdyo film arşivinden yüksek çözünürlüklü kare eşleştirildi.'
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
