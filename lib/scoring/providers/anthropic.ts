import Anthropic from '@anthropic-ai/sdk';
import { InterviewMode, SessionTurn } from '@/types/interview';
import { SessionResult } from '@/types/results';
import { buildScoringPrompt } from '@/lib/prompts/scoring-prompts';
import { ScoringProvider } from '@/lib/scoring/types';
import { getMockEvaluation } from '@/lib/scoring/mock';

export class AnthropicScoringProvider implements ScoringProvider {
  name = 'anthropic' as const;

  async scoreTranscript(
    sessionId: string,
    mode: InterviewMode,
    contextBundle: any,
    turns: SessionTurn[]
  ): Promise<SessionResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!apiKey) {
      console.warn('[Anthropic Provider] ANTHROPIC_API_KEY is not set. Returning mock evaluation.');
      return getMockEvaluation(sessionId, mode);
    }

    const anthropic = new Anthropic({ apiKey });
    const prompt = buildScoringPrompt(mode, contextBundle, turns);
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    try {
      const message = await anthropic.messages.create({
        model: modelName,
        max_tokens: 2500,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const contentBlock = message.content[0];
      if (contentBlock.type !== 'text') {
        throw new Error('Unexpected non-text response from Claude API');
      }

      let rawJson = contentBlock.text.trim();
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
      console.error('[Anthropic Provider] Scoring error:', error);
      return getMockEvaluation(sessionId, mode, `Evaluation generated with fallback: ${error.message}`);
    }
  }
}

export const anthropicProvider = new AnthropicScoringProvider();
