import { NextResponse } from 'next/server';
import { BriefForm, Scene } from '@/types';
import { synthesizeClipsWithGemini } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scenes: Scene[] = body.scenes;
    const brief: BriefForm = body.brief;
    const apiKey: string | undefined = body.apiKey;
    const ttsDisabled: boolean = Boolean(body.ttsDisabled);

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli sahne listesi bulunamadı.' },
        { status: 400 }
      );
    }

    const result = await synthesizeClipsWithGemini(scenes, brief, apiKey, ttsDisabled);

    return NextResponse.json({
      success: true,
      scenes: result.scenes,
      ttsCount: result.ttsCount,
      imgCount: result.imgCount
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: `Görsel ve ses sentezlenirken sunucu hatası: ${message}` },
      { status: 500 }
    );
  }
}

