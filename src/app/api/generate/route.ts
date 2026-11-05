import { NextResponse } from 'next/server';
import { BriefForm } from '@/types';
import { generateScenesWithGemini } from '@/lib/gemini';
import { buildScenesFromSOP } from '@/lib/providers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brief: BriefForm = body.brief || body;
    const apiKey: string | undefined = body.apiKey;
    const llmProvider: string = body.llm || 'gemini';

    if (!brief.product || brief.product.trim().length === 0) {
      return NextResponse.json(
        { error: 'Ürün veya konu başlığı zorunludur.' },
        { status: 400 }
      );
    }

    if (!brief.dur || brief.dur < 5 || brief.dur > 300) {
      return NextResponse.json(
        { error: 'Süre 5 ile 300 saniye arasında olmalıdır.' },
        { status: 400 }
      );
    }

    if (llmProvider === 'local') {
      const scenes = buildScenesFromSOP(brief);
      return NextResponse.json({
        success: true,
        provider: 'local',
        brief,
        scenes,
        generatedAt: new Date().toISOString()
      });
    }

    // Gemini AI ile gerçek senaryo ve sahne planı üret
    const scenes = await generateScenesWithGemini(brief, apiKey);

    return NextResponse.json({
      success: true,
      provider: 'gemini-2.5-flash',
      brief,
      scenes,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: `Senaryo üretilirken sunucu hatası: ${message}` },
      { status: 500 }
    );
  }
}
