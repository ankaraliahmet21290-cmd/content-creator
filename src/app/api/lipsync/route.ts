import { NextResponse } from 'next/server';

/**
 * Klaket Studio - Dudak Senkronizasyonu (Lip-Sync) API Route
 * Replicate / SadTalker / LivePortrait bulut sağlayıcılarını destekler.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, audioUrl, engine, apiKey } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Karakter görseli (imageUrl) zorunludur.' },
        { status: 400 }
      );
    }

    const replicateToken = apiKey || process.env.REPLICATE_API_TOKEN;

    // Eğer Replicate API Token varsa Replicate SadTalker veya LivePortrait modelini çalıştır
    if (replicateToken) {
      const model =
        engine === 'liveportrait'
          ? 'fofr/live-portrait'
          : 'cjwbw/sadtalker';

      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions`, {
          method: 'POST',
          headers: {
            Authorization: `Token ${replicateToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version:
              engine === 'liveportrait'
                ? '0e802ef33d5966a3d6cb256b27bbfe537df32a843588e4e9411961e56b3e9b94'
                : 'a519cc0cf43a0b368d77f0895e0fb05694f4f272c055d084601c83d138f61662',
            input: {
              source_image: imageUrl,
              driven_audio: audioUrl || undefined
            }
          })
        });

        if (response.ok) {
          const prediction = await response.json();
          // Tahmin tamamlanana kadar kısa bekleme/polling veya durum dönüşü
          return NextResponse.json({
            success: true,
            predictionId: prediction.id,
            status: prediction.status,
            videoUrl: prediction.output
          });
        }
      } catch (repErr) {
        console.warn('Replicate API çağrısı sırasında hata:', repErr);
      }
    }

    // Bulut anahtarı yoksa veya hata oluştuysa yerel motora yönlendir
    return NextResponse.json({
      success: true,
      message: 'Bulut anahtarı bulunamadı; yerel motor (built-in audio viseme) devreye alındı.',
      fallbackToLocal: true
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: `Lip-sync API hatası: ${msg}` },
      { status: 500 }
    );
  }
}
