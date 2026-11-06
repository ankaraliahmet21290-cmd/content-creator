import { NextResponse } from 'next/server';
import { searchWikimediaCommons } from '@/lib/webSearch';

/**
 * İnternetten Canlı Gerçek Fotoğraf Arama API'si (Wikimedia Commons API)
 * Kullanıcının girdiği konu veya sahne açıklamasına göre internetten telifsiz,
 * yüksek çözünürlüklü gerçek fotoğrafları anında bulur.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '8', 10);
  return handleSearch(q, limit);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const q = body.query || body.q || '';
    const limit = body.limit || 8;
    return handleSearch(q, limit);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

async function handleSearch(query: string, limit: number) {
  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Arama terimi zorunludur.' }, { status: 400 });
  }

  try {
    const results = await searchWikimediaCommons(query, limit);
    return NextResponse.json({
      success: true,
      provider: 'wikimedia-commons',
      term: query,
      count: results.length,
      results
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg, results: [] }, { status: 500 });
  }
}
