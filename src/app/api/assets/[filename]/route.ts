import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  props: { params: Promise<{ filename: string }> }
) {
  try {
    const params = await props.params;
    const filename = params.filename;
    if (!filename) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const sanitized = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'generated_assets', sanitized);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Asset not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    let contentType = 'application/octet-stream';
    if (sanitized.endsWith('.jpg') || sanitized.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (sanitized.endsWith('.png')) {
      contentType = 'image/png';
    } else if (sanitized.endsWith('.wav')) {
      contentType = 'audio/wav';
    } else if (sanitized.endsWith('.mp3')) {
      contentType = 'audio/mpeg';
    } else if (sanitized.endsWith('.webm')) {
      contentType = 'video/webm';
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(stat.size),
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(msg, { status: 500 });
  }
}
