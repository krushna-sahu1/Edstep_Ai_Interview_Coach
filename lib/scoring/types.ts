import { InterviewMode, SessionTurn } from '@/types/interview';
import { SessionResult } from '@/types/results';

export type ScoringProviderType = 'anthropic' | 'openai' | 'gemini';

export interface ScoringProvider {
  name: ScoringProviderType;
  scoreTranscript(
    sessionId: string,
    mode: InterviewMode,
    contextBundle: any,
    turns: SessionTurn[]
  ): Promise<SessionResult>;
}

export type ScoreTranscriptFunction = (
  sessionId: string,
  mode: InterviewMode,
  contextBundle: any,
  turns: SessionTurn[]
) => Promise<SessionResult>;
