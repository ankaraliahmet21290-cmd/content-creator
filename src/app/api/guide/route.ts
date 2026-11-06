import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'kullanim.md');
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({
      ok: true,
      content,
      title: 'Klaket Studio – Kullanım Kılavuzu'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
