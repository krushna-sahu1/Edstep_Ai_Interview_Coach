import { InterviewMode, SessionTurn } from '@/types/interview';
import { SessionResult } from '@/types/results';
import { buildScoringPrompt } from '@/lib/prompts/scoring-prompts';
import { ScoringProvider } from '@/lib/scoring/types';
import { getMockEvaluation } from '@/lib/scoring/mock';

export class GeminiScoringProvider implements ScoringProvider {
  name = 'gemini' as const;

  async scoreTranscript(
    sessionId: string,
    mode: InterviewMode,
    contextBundle: any,
    turns: SessionTurn[]
  ): Promise<SessionResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      console.warn('[Gemini Provider] GEMINI_API_KEY is not set. Returning mock evaluation.');
      return getMockEvaluation(sessionId, mode);
    }

    const prompt = buildScoringPrompt(mode, contextBundle, turns);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Empty or invalid response structure from Gemini API');
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
      console.error('[Gemini Provider] Scoring error:', error);
      return getMockEvaluation(sessionId, mode, `Evaluation generated with fallback: ${error.message}`);
    }
  }
}

export const geminiProvider = new GeminiScoringProvider();
