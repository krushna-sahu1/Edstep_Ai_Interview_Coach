import { InterviewMode, SessionTurn } from '@/types/interview';
import { SessionResult } from '@/types/results';
import { ScoringProvider, ScoringProviderType } from '@/lib/scoring/types';
import { anthropicProvider } from '@/lib/scoring/providers/anthropic';
import { openaiProvider } from '@/lib/scoring/providers/openai';
import { geminiProvider } from '@/lib/scoring/providers/gemini';

export * from '@/lib/scoring/types';
export * from '@/lib/scoring/mock';
export { anthropicProvider } from '@/lib/scoring/providers/anthropic';
export { openaiProvider } from '@/lib/scoring/providers/openai';
export { geminiProvider } from '@/lib/scoring/providers/gemini';

const providers: Record<ScoringProviderType, ScoringProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  gemini: geminiProvider,
};

/**
 * Resolves the active scoring provider based on:
 * 1. Explicit SCORING_LLM_PROVIDER ('anthropic' | 'openai' | 'gemini')
 * 2. Auto-detection based on present API keys
 * 3. Default fallback to anthropic (which provides mock fallback if no keys exist)
 */
export function getScoringProvider(): ScoringProvider {
  const configured = (process.env.SCORING_LLM_PROVIDER || '').trim().toLowerCase() as ScoringProviderType;

  if (configured && providers[configured]) {
    return providers[configured];
  }

  // Auto-detection by available credentials
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropicProvider;
  }
  if (process.env.OPENAI_API_KEY) {
    return openaiProvider;
  }
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    return geminiProvider;
  }

  // Default provider
  return anthropicProvider;
}

/**
 * Unified provider-agnostic scoring function.
 * Evaluates candidate interview transcript with the active LLM provider.
 */
export async function scoreTranscript(
  sessionId: string,
  mode: InterviewMode,
  contextBundle: any,
  turns: SessionTurn[]
): Promise<SessionResult> {
  const provider = getScoringProvider();
  return provider.scoreTranscript(sessionId, mode, contextBundle, turns);
}

// Backward-compatible alias matching previous function name in lib/claude.ts
export const scoreInterviewTranscript = scoreTranscript;
