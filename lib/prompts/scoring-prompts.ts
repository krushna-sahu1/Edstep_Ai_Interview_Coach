import { InterviewMode, SessionTurn } from '@/types/interview';

export function buildScoringPrompt(
  mode: InterviewMode,
  contextBundle: any,
  turns: SessionTurn[]
): string {
  const formattedTurns = turns
    .map((t, idx) => `[Turn ${idx + 1}] (${t.speaker.toUpperCase()}): ${t.speaker === 'agent' ? t.question_text : t.answer_transcript}`)
    .join('\n');

  const modeInstructions =
    mode === 'job'
      ? `MODE: JOB INTERVIEW
RUBRIC:
1. Relevance & Specificity (Weight: 25%): Did the candidate answer the exact question asked with concrete technical or behavioral specifics rather than generic buzzwords?
2. Technical Accuracy & Depth (Weight: 25%): Did the candidate demonstrate verifiable domain knowledge, awareness of architectural trade-offs, and alignment with the technologies mentioned in their resume/GitHub?
3. Structure & Communication (Weight: 25%): For behavioral questions, did they apply the STAR format (Situation, Task, Action, Result)? Is their explanation clear and concise?
4. Delivery Signals & Confidence (Weight: 25%): Frequency of hedging words, filler words, clarity of thought, and executive presence.`
      : `MODE: VISA CONSULAR INTERVIEW
RUBRIC:
1. Directness & Clarity (Weight: 30%): Did the applicant answer the officer's specific question directly without evasiveness, hesitation, or rambling?
2. Financial Clarity & Credibility (Weight: 25%): Are the funding source, family income, and ability to cover all living costs convincingly and realistically explained?
3. Non-Immigrant Intent & Ties to Home Country (Weight: 30%): Did the applicant articulate clear, tangible reasons and career motivations to return to their home country upon completion?
4. Credibility & Consular Red Flags (Weight: 15%): Flag any inconsistent statements, vague course justifications, suspicious lack of details, or violation of non-immigrant intent.`;

  return `You are an elite interview assessment evaluator and senior career/immigration advisor.
Analyze the following interview transcript and return a rigorous, actionable evaluation report.

${modeInstructions}

--- CONTEXT BUNDLE PROVIDED ---
${JSON.stringify(contextBundle, null, 2)}

--- FULL INTERVIEW TRANSCRIPT ---
${formattedTurns || 'No spoken transcript turns recorded.'}

CRITICAL INSTRUCTIONS:
- You must output strictly valid JSON matching the exact schema below, with no surrounding markdown backticks or commentary.
- Scores must be integers from 0 to 100 based on genuine performance.
- per_question_feedback must review each substantial question asked by the interviewer, summarize what the candidate answered, provide actionable feedback, and rate it as "strong", "adequate", or "needs_work".
- flagged_concerns should highlight any red flags or dealbreakers (especially for Visa mode).

OUTPUT SCHEMA (JSON only):
{
  "overall_score": number,
  "category_scores": {
    "Category Name": number
  },
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "per_question_feedback": [
    {
      "question": "string",
      "answer_summary": "string",
      "feedback": "string",
      "rating": "strong"
    }
  ],
  "flagged_concerns": ["string"]
}`;
}
