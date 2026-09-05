import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { scoreInterviewTranscript } from '@/lib/scoring';
import { InterviewMode, SessionTurn } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, turns: clientTurns, mode: clientMode, context_bundle: clientBundle } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required.' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    let mode: InterviewMode = clientMode || 'job';
    let contextBundle = clientBundle || {};
    let turns: SessionTurn[] = clientTurns || [];

    if (supabase) {
      // 1. Fetch session record
      const { data: sessionData } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', session_id)
        .single();

      if (sessionData) {
        mode = sessionData.mode;
        contextBundle = sessionData.context_bundle;

        // Mark session completed
        await supabase
          .from('interview_sessions')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
          })
          .eq('id', session_id);
      }

      // 2. Fetch turns from database if available
      const { data: dbTurns } = await supabase
        .from('session_turns')
        .select('*')
        .eq('session_id', session_id)
        .order('turn_index', { ascending: true });

      if (dbTurns && dbTurns.length > 0) {
        turns = dbTurns;
      }
    }

    // 3. Score transcript using Claude API
    const result = await scoreInterviewTranscript(session_id, mode, contextBundle, turns);

    // 4. Persist result in Supabase
    if (supabase) {
      const { error: resultError } = await supabase.from('session_results').upsert({
        session_id,
        overall_score: result.overall_score,
        category_scores: result.category_scores,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        per_question_feedback: result.per_question_feedback,
        flagged_concerns: result.flagged_concerns,
        created_at: result.created_at || new Date().toISOString(),
      });

      if (resultError) {
        console.error('Failed to persist session_results:', resultError);
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Interview end error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to finalize and score interview session.' },
      { status: 500 }
    );
  }
}
