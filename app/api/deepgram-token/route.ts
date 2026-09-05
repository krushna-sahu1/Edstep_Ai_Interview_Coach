import { NextResponse } from 'next/server';
import { generateDeepgramTempToken } from '@/lib/deepgram';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = await generateDeepgramTempToken();
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
