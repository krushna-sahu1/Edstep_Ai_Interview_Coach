import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, turn_index, speaker, question_text, answer_transcript } = body;

    if (!session_id || turn_index === undefined || !speaker) {
      return NextResponse.json({ error: 'Missing required turn parameters.' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (supabase) {
      const { error } = await supabase.from('session_turns').insert({
        session_id,
        turn_index,
        speaker,
        question_text: question_text || '',
        answer_transcript: answer_transcript || '',
        timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase turn insert error:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Turn sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
