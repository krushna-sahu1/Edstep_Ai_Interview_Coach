import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSupabase } from '@/lib/supabase/server';
import { buildJobSystemPrompt } from '@/lib/prompts/job-prompt';
import { buildVisaSystemPrompt } from '@/lib/prompts/visa-prompt';
import { buildDeepgramAgentConfig } from '@/lib/deepgram';
import { ContextBundle, InterviewMode } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode: InterviewMode = body.mode;
    const contextBundle: ContextBundle = body.context_bundle;

    if (!mode || (mode !== 'job' && mode !== 'visa')) {
      return NextResponse.json({ error: 'Valid mode ("job" | "visa") is required.' }, { status: 400 });
    }

    if (!contextBundle) {
      return NextResponse.json({ error: 'context_bundle is required.' }, { status: 400 });
    }

    // 1. Synthesize personalized system prompt
    let systemPrompt = '';
    if (mode === 'job') {
      systemPrompt = buildJobSystemPrompt(contextBundle as any);
    } else {
      systemPrompt = buildVisaSystemPrompt(contextBundle as any);
    }

    // 2. Build Deepgram agent configuration
    const agentConfig = buildDeepgramAgentConfig(systemPrompt);

    // 3. Persist session in Supabase if configured
    const supabase = getServerSupabase();
    let sessionId = crypto.randomUUID();

    if (supabase) {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          id: sessionId,
          mode,
          context_bundle: contextBundle,
          status: 'in_progress',
        })
        .select('id')
        .single();

      if (error) {
        console.error('Supabase session insert error:', error);
      } else if (data?.id) {
        sessionId = data.id;
      }
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      mode,
      agent_config: agentConfig,
      system_prompt: systemPrompt,
    });
  } catch (error: any) {
    console.error('Interview start error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize interview session.' },
      { status: 500 }
    );
  }
}
