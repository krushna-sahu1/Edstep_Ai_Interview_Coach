import { NextResponse } from 'next/server';
import { appendFile } from 'fs/promises';
import path from 'path';
import { generateDeepgramTempToken } from '@/lib/deepgram';

export const dynamic = 'force-dynamic';

async function debugLog(payload: Record<string, unknown>) {
  const body = JSON.stringify({ sessionId: '9a388a', runId: 'pre-fix', timestamp: Date.now(), ...payload });
  fetch('http://127.0.0.1:7265/ingest/b5d1d86f-bdab-4fcc-8ca3-2bb8ed6e04c5', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '9a388a' },
    body,
  }).catch(() => {});
  try {
    await appendFile(path.join(process.cwd(), 'debug-9a388a.log'), `${body}\n`);
  } catch {
    // ignore
  }
}

export async function GET() {
  try {
    const token = await generateDeepgramTempToken();
    // #region agent log
    await debugLog({
      hypothesisId: 'C',
      location: 'deepgram-token/route.ts:GET',
      message: 'minted temp token',
      data: { tokenLen: token.length, looksLikeJwt: token.startsWith('eyJ') },
    });
    // #endregion
    return new NextResponse(token, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.warn('Deepgram temp token generation failed, checking fallback to DEEPGRAM_API_KEY for dev environment:', error.message);
    const directApiKey = process.env.DEEPGRAM_API_KEY;
    if (directApiKey) {
      // #region agent log
      await debugLog({
        hypothesisId: 'C',
        location: 'deepgram-token/route.ts:fallback',
        message: 'grant failed; falling back to raw API key',
        data: { grantError: String(error?.message || ''), keyLen: directApiKey.length },
      });
      // #endregion
      return new NextResponse(directApiKey, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to obtain Deepgram authentication token' },
      { status: 500 }
    );
  }
}
