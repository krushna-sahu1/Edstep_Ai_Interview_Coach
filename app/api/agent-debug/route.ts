import { NextResponse } from 'next/server';
import { appendFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.text()).trim();
    if (!body) return new NextResponse(null, { status: 204 });
    const line = body.endsWith('\n') ? body : `${body}\n`;
    await appendFile(path.join(process.cwd(), 'debug-9a388a.log'), line);
    fetch('http://127.0.0.1:7265/ingest/b5d1d86f-bdab-4fcc-8ca3-2bb8ed6e04c5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '9a388a' },
      body,
    }).catch(() => {});
  } catch {
    // ignore debug sink failures
  }
  return new NextResponse(null, { status: 204 });
}
