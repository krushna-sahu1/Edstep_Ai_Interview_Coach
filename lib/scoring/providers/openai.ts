import { InterviewMode, SessionTurn } from '@/types/interview';
import { SessionResult } from '@/types/results';
import { buildScoringPrompt } from '@/lib/prompts/scoring-prompts';
import { ScoringProvider } from '@/lib/scoring/types';
import { getMockEvaluation } from '@/lib/scoring/mock';

export class OpenAIScoringProvider implements ScoringProvider {
  name = 'openai' as const;

  async scoreTranscript(
    sessionId: string,
    mode: InterviewMode,
    contextBundle: any,
    turns: SessionTurn[]
  ): Promise<SessionResult> {
    const apiKey = process.env.OPENAI_API_KEY || '';
    if (!apiKey) {
      console.warn('[OpenAI Provider] OPENAI_API_KEY is not set. Returning mock evaluation.');
      return getMockEvaluation(sessionId, mode);
    }

    const prompt = buildScoringPrompt(mode, contextBundle, turns);
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o';

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are an elite interview assessment evaluator. You must return strictly valid JSON matching the requested schema.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty or invalid response structure from OpenAI API');
      }

      let rawJson = content.trim();
      if (rawJson.startsWith('```')) {
        rawJson = rawJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(rawJson);

      return {
        session_id: sessionId,
        overall_score: Math.min(100, Math.max(0, Math.round(parsed.overall_score || 75))),
        category_scores: parsed.category_scores || {},
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        per_question_feedback: Array.isArray(parsed.per_question_feedback) ? parsed.per_question_feedback : [],
        flagged_concerns: Array.isArray(parsed.flagged_concerns) ? parsed.flagged_concerns : [],
        created_at: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[OpenAI Provider] Scoring error:', error);
      return getMockEvaluation(sessionId, mode, `Evaluation generated with fallback: ${error.message}`);
    }
  }
}

export const openaiProvider = new OpenAIScoringProvider();
