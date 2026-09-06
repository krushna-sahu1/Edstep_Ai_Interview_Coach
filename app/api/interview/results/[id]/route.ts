import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase is not configured on this server.' },
      { status: 503 }
    );
  }

  try {
    const [sessionRes, resultsRes] = await Promise.all([
      supabase.from('interview_sessions').select('*').eq('id', sessionId).single(),
      supabase.from('session_results').select('*').eq('session_id', sessionId).single(),
    ]);

    if (resultsRes.error && !resultsRes.data) {
      return NextResponse.json(
        { error: 'Results not found for this interview session.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: sessionRes.data,
      result: resultsRes.data,
    });
  } catch (error: any) {
    console.error('Error fetching interview results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
